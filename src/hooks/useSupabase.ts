import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueLinkId, normalizePayload } from "@/lib/linkUtils";

// Types from database
export interface Chalet {
  id: string;
  name: string;
  country_code: string;
  city: string;
  address: string;
  default_price: number;
  images: string[];
  provider_id: string | null;
  verified: boolean;
  amenities: string[];
  capacity: number;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  country_code: string;
  services: string[];
  contact: string | null;
  website: string | null;
  logo_path: string | null;
}

export interface Link {
  id: string;
  type: string;
  country_code: string;
  provider_id: string | null;
  payload: any;
  microsite_url: string;
  payment_url: string;
  signature: string;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  link_id: string | null;
  amount: number;
  currency: string;
  status: string;
  otp: string | null;
  attempts: number;
  locked_until: string | null;
  receipt_url: string | null;
  cardholder_name: string | null;
  last_four: string | null;
  created_at: string;
}

// Fetch chalets by country
export const useChalets = (countryCode?: string) => {
  return useQuery({
    queryKey: ["chalets", countryCode],
    queryFn: async () => {
      let query = (supabase as any).from("chalets").select("*");
      
      if (countryCode) {
        query = query.eq("country_code", countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Chalet[];
    },
    enabled: !!countryCode,
  });
};

// Fetch shipping carriers by country
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      let query = (supabase as any).from("shipping_carriers").select("*");
      
      if (countryCode) {
        query = query.eq("country_code", countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ShippingCarrier[];
    },
    enabled: !!countryCode,
  });
};

// Create link
export const useCreateLink = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkData: {
      type: string;
      country_code: string;
      provider_id?: string;
      payload: any;
    }) => {
      // Normalize payload for consistent hashing
      const normalizedPayload = normalizePayload({
        ...linkData.payload,
        country_code: linkData.country_code,
        type: linkData.type,
      });
      
      // Generate unique link ID based on data
      const linkId = generateUniqueLinkId(normalizedPayload, linkData.type, linkData.country_code);
      
      const micrositeUrl = `${window.location.origin}/r/${linkData.country_code}/${linkData.type}/${linkId}`;
      const paymentUrl = `${window.location.origin}/pay/${linkId}`;
      
      // Create signature from normalized payload
      const signature = btoa(encodeURIComponent(JSON.stringify(normalizedPayload)));
      
      // Check if link with same ID already exists
      const { data: existingLink } = await (supabase as any)
        .from("links")
        .select("id")
        .eq("id", linkId)
        .maybeSingle();
      
      if (existingLink) {
        // If link exists, return it (same data should produce same link)
        return existingLink as Link;
      }
      
      // Insert new link
      const { data, error } = await (supabase as any)
        .from("links")
        .insert({
          id: linkId,
          type: linkData.type,
          country_code: linkData.country_code,
          provider_id: linkData.provider_id,
          payload: normalizedPayload,
          microsite_url: micrositeUrl,
          payment_url: paymentUrl,
          signature,
          status: "active",
        })
        .select()
        .single();
      
      if (error) {
        // If error is due to duplicate, try to fetch existing link
        if (error.code === '23505') { // Unique constraint violation
          const { data: existing } = await (supabase as any)
            .from("links")
            .select("*")
            .eq("id", linkId)
            .single();
          if (existing) {
            return existing as Link;
          }
        }
        throw error;
      }
      
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "تم إنشاء الرابط",
        description: "تم إنشاء رابط الخدمة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الرابط",
        variant: "destructive",
      });
    },
  });
};

// Fetch link by ID
export const useLink = (linkId?: string) => {
  return useQuery({
    queryKey: ["link", linkId],
    queryFn: async () => {
      try {
        if (!linkId) {
          throw new Error("Link ID is required");
        }
        
        // Validate linkId format
        if (typeof linkId !== 'string' || linkId.length < 10) {
          throw new Error("Invalid link ID format");
        }
        
        const { data, error } = await (supabase as any)
          .from("links")
          .select("*")
          .eq("id", linkId)
          .single();
        
        if (error) {
          // Check if it's a "not found" error
          if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
            throw new Error("الرابط غير موجود");
          }
          console.error("Error fetching link:", error);
          throw new Error(error.message || "حدث خطأ أثناء تحميل الرابط");
        }
        
        if (!data) {
          throw new Error("الرابط غير موجود");
        }
        
        // Validate link data structure
        if (!data.type) {
          throw new Error("الرابط غير صحيح");
        }
        
        // Ensure payload exists (can be empty object)
        if (!data.payload) {
          data.payload = {};
        }
        
        return data as Link;
      } catch (err: any) {
        console.error("useLink error:", err);
        // Return a user-friendly error message
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("حدث خطأ أثناء تحميل الرابط");
      }
    },
    enabled: !!linkId && typeof linkId === 'string' && linkId.length > 0,
    retry: (failureCount, error: any) => {
      // Don't retry on "not found" errors
      if (error?.message?.includes('غير موجود')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create payment
export const useCreatePayment = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (paymentData: {
      link_id: string;
      amount: number;
      currency: string;
    }) => {
      // Generate OTP (4 digits)
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data, error } = await (supabase as any)
        .from("payments")
        .insert({
          ...paymentData,
          otp,
          status: "pending",
          attempts: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Payment;
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الدفعة",
        variant: "destructive",
      });
    },
  });
};

// Fetch payment by ID
export const usePayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payments")
        .select("*")
        .eq("id", paymentId!)
        .single();
      
      if (error) throw error;
      return data as Payment;
    },
    enabled: !!paymentId,
    refetchInterval: 2000, // Refresh every 2 seconds for OTP status
  });
};

// Update payment (for OTP verification)
export const useUpdatePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      paymentId,
      updates,
    }: {
      paymentId: string;
      updates: Partial<Payment>;
    }) => {
      const { data, error } = await (supabase as any)
        .from("payments")
        .update(updates)
        .eq("id", paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
    },
  });
};
