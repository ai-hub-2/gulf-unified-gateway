import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createOfflineLink, getFallbackLink, rememberLink } from "@/lib/offlineLinks";

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
      if (!isSupabaseConfigured || !supabase) {
        return [] as Chalet[];
      }

      let query = (supabase as any).from("chalets").select("*");
      
      if (countryCode) {
        query = query.eq("country_code", countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Chalet[];
    },
    enabled: !!countryCode,
    retry: isSupabaseConfigured,
  });
};

// Fetch shipping carriers by country
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return [] as ShippingCarrier[];
      }

      let query = (supabase as any).from("shipping_carriers").select("*");
      
      if (countryCode) {
        query = query.eq("country_code", countryCode);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ShippingCarrier[];
    },
    enabled: !!countryCode,
    retry: isSupabaseConfigured,
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
      const linkId = crypto.randomUUID();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const offlineLink = createOfflineLink({
        linkId,
        type: linkData.type,
        countryCode: linkData.country_code,
        payload: linkData.payload,
        origin,
      });

      if (!isSupabaseConfigured || !supabase) {
        return offlineLink as Link;
      }

      const { data, error } = await (supabase as any)
        .from("links")
        .insert({
          id: linkId,
          type: linkData.type,
          country_code: linkData.country_code,
          provider_id: linkData.provider_id,
          payload: linkData.payload,
          microsite_url: offlineLink.microsite_url,
          payment_url: offlineLink.payment_url,
          signature: offlineLink.signature,
          status: "active",
        })
        .select()
        .single();
      
      if (error) throw error;

      rememberLink(offlineLink);
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
      const fallback = getFallbackLink(linkId);

      if (!isSupabaseConfigured || !supabase) {
        if (fallback) {
          return fallback as Link;
        }
        throw new Error("لا توجد بيانات متاحة للرابط بدون التكامل الخارجي");
      }

      try {
        const { data, error } = await (supabase as any)
          .from("links")
          .select("*")
          .eq("id", linkId!)
          .single();
        
        if (error) throw error;

        if (data && typeof window !== "undefined") {
          const offlineRepresentation = createOfflineLink({
            linkId: data.id,
            type: data.type,
            countryCode: data.country_code,
            payload: data.payload || {},
            origin: window.location.origin,
          });

          rememberLink(offlineRepresentation);

          return {
            ...data,
            microsite_url: offlineRepresentation.microsite_url,
            payment_url: offlineRepresentation.payment_url,
            signature: offlineRepresentation.signature,
          } as Link;
        }

        return data as Link;
      } catch (error) {
        if (fallback) {
          return fallback as Link;
        }
        throw error;
      }
    },
    enabled: !!linkId || (!isSupabaseConfigured && typeof window !== "undefined"),
    retry: isSupabaseConfigured,
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
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("التكامل مع Supabase غير مفعّل. لا يمكن إنشاء عمليات دفع بدون API خارجي.");
      }

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
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("التكامل مع Supabase غير متوفر");
      }

      const { data, error } = await (supabase as any)
        .from("payments")
        .select("*")
        .eq("id", paymentId!)
        .single();
      
      if (error) throw error;
      return data as Payment;
    },
    enabled: !!paymentId && isSupabaseConfigured,
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
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("التكامل مع Supabase غير متوفر");
      }

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
