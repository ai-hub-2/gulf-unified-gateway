import { getServiceBranding, normalizeServiceKey } from "@/lib/serviceLogos";

const STORAGE_KEY_PREFIX = "offline-link:";

const encodePayload = (payload: Record<string, unknown>) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  } catch (error) {
    console.warn("Failed to encode payload", error);
    return "";
  }
};

const decodePayload = (encoded?: string | null) => {
  if (!encoded) return null;

  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (error) {
    console.warn("Failed to decode payload", error);
    return null;
  }
};

const parseAmount = (value?: string | number | null) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;

  const cleaned = value.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const ensureSearchParams = (url: URL, payload: Record<string, unknown>) => {
  const searchParams = new URLSearchParams(url.search);
  const encodedPayload = encodePayload(payload);
  let updated = false;

  if (encodedPayload && searchParams.get("payload") !== encodedPayload) {
    searchParams.set("payload", encodedPayload);
    updated = true;
  }

  const serviceKey = typeof payload.service_key === "string" ? payload.service_key : undefined;
  if (serviceKey && searchParams.get("service") !== serviceKey) {
    searchParams.set("service", serviceKey);
    updated = true;
  }

  const amount = parseAmount((payload as any).cod_amount);
  if (amount !== undefined && searchParams.get("amount") !== String(amount)) {
    searchParams.set("amount", String(amount));
    updated = true;
  }

  const trackingNumber = (payload as any)?.tracking_number;
  if (trackingNumber && searchParams.get("tracking") !== trackingNumber) {
    searchParams.set("tracking", trackingNumber);
    updated = true;
  }

  const packageDescription = (payload as any)?.package_description;
  if (packageDescription && searchParams.get("package") !== packageDescription) {
    searchParams.set("package", packageDescription);
    updated = true;
  }

  if (updated && typeof window !== "undefined") {
    const newUrl = `${url.origin}${url.pathname}?${searchParams.toString()}${url.hash}`;
    window.history.replaceState({}, "", newUrl);
  }

  return searchParams;
};

const detectTypeFromPath = (pathname: string, fallback?: string | null) => {
  if (pathname.includes("/chalet")) return "chalet";
  if (pathname.includes("/shipping")) return "shipping";
  if (pathname.includes("/pay")) return fallback || "shipping";
  return fallback || "shipping";
};

const detectLinkIdFromPath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "r" && segments.length >= 4) {
    return segments[3];
  }

  if (segments[0] === "pay" && segments.length >= 2) {
    return segments[1];
  }

  return null;
};

const detectCountryFromPath = (pathname: string, fallback?: string | null) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "r" && segments.length >= 2) {
    return segments[1];
  }

  return fallback || "SA";
};

const getCachedLink = (linkId: string) => {
  if (typeof window === "undefined") return null;
  const cached = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${linkId}`);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const cacheLink = (link: any) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${link.id}`, JSON.stringify(link));
    sessionStorage.setItem("fallback:last-link", JSON.stringify(link));
  } catch (error) {
    console.warn("Failed to cache offline link", error);
  }
};

const buildPayloadFromSearchParams = (searchParams: URLSearchParams, defaults: Record<string, unknown>) => {
  const encodedPayload = searchParams.get("payload");
  const decodedPayload = decodePayload(encodedPayload);

  const serviceCandidate = searchParams.get("service") || decodedPayload?.service_key || defaults.service_key;
  const normalizedServiceKey = normalizeServiceKey(
    serviceCandidate || undefined,
    (decodedPayload?.service_name as string | undefined) || (defaults.service_name as string | undefined)
  );

  const amountCandidate = searchParams.get("amount") || (decodedPayload?.cod_amount as string | number | undefined);
  const trackingCandidate = searchParams.get("tracking") || (decodedPayload?.tracking_number as string | undefined);
  const packageCandidate = searchParams.get("package") || (decodedPayload?.package_description as string | undefined);

  const branding = getServiceBranding(normalizedServiceKey);

  const mergedPayload = {
    ...defaults,
    ...decodedPayload,
    service_key: normalizedServiceKey,
    service_name:
      decodedPayload?.service_name ||
      (defaults.service_name as string | undefined) ||
      serviceCandidate ||
      normalizedServiceKey.toUpperCase(),
    service_description: decodedPayload?.service_description || branding.description,
    cod_amount: parseAmount(amountCandidate),
    tracking_number: trackingCandidate || defaultIfEmpty(defaults.tracking_number),
    package_description: packageCandidate || defaultIfEmpty(defaults.package_description),
  };

  return mergedPayload;
};

const defaultIfEmpty = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

export const getFallbackLink = (linkId?: string | null) => {
  if (typeof window === "undefined") return null;

  const currentUrl = new URL(window.location.href);
  const resolvedLinkId = linkId || detectLinkIdFromPath(currentUrl.pathname);

  if (!resolvedLinkId) {
    return null;
  }

  const cached = getCachedLink(resolvedLinkId);
  if (cached) {
    return cached;
  }

  const typeFromPath = detectTypeFromPath(currentUrl.pathname, (defaultIfEmpty(currentUrl.searchParams.get("type")) as string) || undefined);
  const countryFromPath = detectCountryFromPath(
    currentUrl.pathname,
    (defaultIfEmpty(currentUrl.searchParams.get("country")) as string) || undefined
  ).toUpperCase();

  const defaults = {
    service_key: currentUrl.searchParams.get("service") || "aramex",
    service_name: currentUrl.searchParams.get("serviceName") || undefined,
    tracking_number: currentUrl.searchParams.get("tracking") || undefined,
    package_description: currentUrl.searchParams.get("package") || undefined,
    cod_amount: parseAmount(currentUrl.searchParams.get("amount")),
    country_code: countryFromPath,
    type: typeFromPath,
  };

  const payload = buildPayloadFromSearchParams(currentUrl.searchParams, defaults);
  const ensuredSearchParams = ensureSearchParams(currentUrl, payload);
  const queryString = ensuredSearchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : "";

  const fallbackLink = {
    id: resolvedLinkId,
    type: typeFromPath,
    country_code: countryFromPath,
    provider_id: null,
    payload,
    microsite_url: `${currentUrl.origin}/r/${countryFromPath}/${typeFromPath}/${resolvedLinkId}${querySuffix}`,
    payment_url: `${currentUrl.origin}/pay/${resolvedLinkId}${querySuffix}`,
    signature: encodePayload(payload),
    status: "offline",
    created_at: new Date().toISOString(),
  };

  cacheLink(fallbackLink);

  return fallbackLink;
};

export const createOfflineLink = ({
  linkId,
  type,
  countryCode,
  payload,
  origin,
}: {
  linkId: string;
  type: string;
  countryCode: string;
  payload: Record<string, unknown>;
  origin: string;
}) => {
  const normalizedType = type || "shipping";
  const normalizedCountry = countryCode.toUpperCase() || "SA";
  const encodedPayload = encodePayload(payload);

  const searchParams = new URLSearchParams();
  if (payload.service_key) {
    searchParams.set("service", String(payload.service_key));
  }

  if (payload.cod_amount !== undefined) {
    const amount = parseAmount(payload.cod_amount as string | number | null);
    if (amount !== undefined) {
      searchParams.set("amount", String(amount));
    }
  }

  if (payload.tracking_number) {
    searchParams.set("tracking", String(payload.tracking_number));
  }

  if (payload.package_description) {
    searchParams.set("package", String(payload.package_description));
  }

  if (encodedPayload) {
    searchParams.set("payload", encodedPayload);
  }

  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : "";

  const link = {
    id: linkId,
    type: normalizedType,
    country_code: normalizedCountry,
    provider_id: null,
    payload,
    microsite_url: `${origin}/r/${normalizedCountry}/${normalizedType}/${linkId}${querySuffix}`,
    payment_url: `${origin}/pay/${linkId}${querySuffix}`,
    signature: encodedPayload,
    status: "offline",
    created_at: new Date().toISOString(),
  };

  cacheLink(link);

  return link;
};

export const rememberLink = (link: any) => {
  cacheLink(link);
};
