import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      const urls = buildStandaloneLink(linkId, linkData.type, linkData.country_code, linkData.payload, origin);

      if (!isSupabaseConfigured || !supabase) {
        rememberLinkInSession(urls);
        return urls as Link;
      }

      const { data, error } = await (supabase as any)
        .from("links")
        .insert({
          id: linkId,
          type: linkData.type,
          country_code: linkData.country_code,
          provider_id: linkData.provider_id,
          payload: linkData.payload,
          microsite_url: urls.microsite_url,
          payment_url: urls.payment_url,
          signature: urls.signature,
          status: "active",
        })
        .select()
        .single();
      
      if (error) throw error;

      rememberLinkInSession(urls);
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
      const standalone = resolveStandaloneLink(linkId);

      if (!isSupabaseConfigured || !supabase) {
        if (standalone) {
          return standalone as Link;
        }
        throw new Error("لا توجد بيانات متاحة لهذا الرابط");
      }

      try {
        const { data, error } = await (supabase as any)
          .from("links")
          .select("*")
          .eq("id", linkId!)
          .single();
        
        if (error) throw error;

        if (data && typeof window !== "undefined") {
          const enriched = buildStandaloneLink(
            data.id,
            data.type,
            data.country_code,
            data.payload || {},
            window.location.origin
          );

          rememberLinkInSession(enriched);

          return {
            ...data,
            microsite_url: enriched.microsite_url,
            payment_url: enriched.payment_url,
            signature: enriched.signature,
          } as Link;
        }

        return data as Link;
      } catch (error) {
        if (standalone) {
          return standalone as Link;
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

/* -------------------------------------------------------
 * Standalone link helpers (no external API required)
 * ----------------------------------------------------- */

const STORAGE_KEY_PREFIX = "standalone-link:";

function encodePayload(payload: Record<string, unknown>) {
  try {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch (error) {
    console.warn("Failed to encode link payload", error);
    return "";
  }
}

function decodePayload(encoded?: string | null) {
  if (!encoded) return {};

  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (error) {
    console.warn("Failed to decode link payload", error);
    return {};
  }
}

function parseNumericAmount(value?: string | number | null) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function detectTypeFromPath(pathname: string, fallback = "shipping") {
  if (pathname.includes("/chalet")) return "chalet";
  if (pathname.includes("/shipping")) return "shipping";
  if (pathname.includes("/pay")) return fallback;
  return fallback;
}

function detectLinkIdFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;

  if (segments[0] === "r" && segments.length >= 4) {
    return segments[3];
  }

  if (segments[0] === "pay" && segments.length >= 2) {
    return segments[1];
  }

  return null;
}

function detectCountryFromPath(pathname: string, fallback = "SA") {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "r" && segments.length >= 2) {
    return segments[1];
  }
  return fallback;
}

function ensureSearchParams(
  url: URL,
  payload: Record<string, unknown>,
  extra: { serviceKey: string; serviceName?: string; amount?: number; tracking?: string; packageDescription?: string }
) {
  const params = new URLSearchParams(url.search);
  const encodedPayload = encodePayload(payload);

  if (encodedPayload) {
    params.set("payload", encodedPayload);
  }

  if (extra.serviceKey) {
    params.set("service", extra.serviceKey);
  }

  if (extra.serviceName) {
    params.set("serviceName", extra.serviceName);
  }

  if (extra.amount !== undefined) {
    params.set("amount", String(extra.amount));
  }

  if (extra.tracking) {
    params.set("tracking", extra.tracking);
  }

  if (extra.packageDescription) {
    params.set("package", extra.packageDescription);
  }

  return params;
}

function buildStandaloneLink(
  linkId: string,
  type: string,
  countryCode: string,
  payload: Record<string, unknown>,
  origin: string
) {
  const normalizedType = type || "shipping";
  const normalizedCountry = countryCode?.toUpperCase?.() || "SA";
  const serviceKey = String(payload.service_key || "aramex").toLowerCase();
  const amount = parseNumericAmount(payload.cod_amount as string | number | undefined);
  const trackingNumber = payload.tracking_number as string | undefined;
  const packageDescription = payload.package_description as string | undefined;

  const params = new URLSearchParams();

  if (serviceKey) params.set("service", serviceKey);
  const serviceName = payload.service_name as string | undefined;
  if (serviceName) params.set("serviceName", serviceName);
  if (amount !== undefined) params.set("amount", String(amount));
  if (trackingNumber) params.set("tracking", trackingNumber);
  if (packageDescription) params.set("package", packageDescription);

  const encoded = encodePayload(payload);
  if (encoded) params.set("payload", encoded);

  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  return {
    id: linkId,
    type: normalizedType,
    country_code: normalizedCountry,
    provider_id: null,
    payload,
    microsite_url: `${origin}/r/${normalizedCountry}/${normalizedType}/${linkId}${suffix}`,
    payment_url: `${origin}/pay/${linkId}${suffix}`,
    signature: encoded,
    status: "standalone",
    created_at: new Date().toISOString(),
  };
}

function resolveStandaloneLink(linkId?: string | null) {
  if (typeof window === "undefined") return null;

  const currentUrl = new URL(window.location.href);
  const resolvedId = linkId || detectLinkIdFromPath(currentUrl.pathname) || currentUrl.searchParams.get("linkId");

  if (!resolvedId) {
    return readFromSession(resolvedId);
  }

  const payloadFromQuery = decodePayload(currentUrl.searchParams.get("payload"));
  const serviceKey = (currentUrl.searchParams.get("service") || payloadFromQuery.service_key || "aramex").toString();
  const amount = parseNumericAmount(currentUrl.searchParams.get("amount") || (payloadFromQuery.cod_amount as any));
  const tracking = currentUrl.searchParams.get("tracking") || (payloadFromQuery.tracking_number as string | undefined);
  const packageDescription =
    currentUrl.searchParams.get("package") || (payloadFromQuery.package_description as string | undefined);
  const serviceNameParam = currentUrl.searchParams.get("serviceName");

  const type = detectTypeFromPath(currentUrl.pathname, String(payloadFromQuery.type || "shipping"));
  const country = detectCountryFromPath(currentUrl.pathname, String(payloadFromQuery.country_code || "SA"));
  const serviceName =
    (payloadFromQuery.service_name as string | undefined) || serviceNameParam || serviceKey.toUpperCase();

  const mergedPayload: Record<string, unknown> = {
    ...payloadFromQuery,
    service_key: serviceKey,
    service_name: serviceName,
    cod_amount: amount,
    tracking_number: tracking,
    package_description: packageDescription,
    type,
    country_code: country,
  };

  const params = ensureSearchParams(currentUrl, mergedPayload, {
    serviceKey,
    serviceName,
    amount,
    tracking,
    packageDescription,
  });

  const queryString = params.toString();
  const querySuffix = queryString ? `?${queryString}` : "";
  const origin = `${currentUrl.protocol}//${currentUrl.host}`;

  const link = {
    id: resolvedId,
    type,
    country_code: country,
    provider_id: null,
    payload: mergedPayload,
    microsite_url: `${origin}/r/${country}/${type}/${resolvedId}${querySuffix}`,
    payment_url: `${origin}/pay/${resolvedId}${querySuffix}`,
    signature: encodePayload(mergedPayload),
    status: "standalone",
    created_at: new Date().toISOString(),
  };

  rememberLinkInSession(link);

  if (currentUrl.search !== `?${queryString}`) {
    const newUrl = `${currentUrl.origin}${currentUrl.pathname}${querySuffix}${currentUrl.hash}`;
    window.history.replaceState({}, "", newUrl);
  }

  return link;
}

function rememberLinkInSession(link: any) {
  if (typeof window === "undefined" || !link?.id) return;
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${link.id}`, JSON.stringify(link));
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}last`, JSON.stringify(link));
  } catch (error) {
    console.warn("Failed to persist link in session", error);
  }
}

function readFromSession(linkId?: string | null) {
  if (typeof window === "undefined") return null;
  const key = linkId ? `${STORAGE_KEY_PREFIX}${linkId}` : `${STORAGE_KEY_PREFIX}last`;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
