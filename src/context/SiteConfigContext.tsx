import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, PLANS, CITIES, FAQS, TESTIMONIALS, type Product } from "../data";
import STATIC_CONFIG from "../site-config.json";
import { buildWhatsAppLink } from "../utils/whatsapp";

export interface PlanConfig {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  tagline: string;
  badge: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

export interface CityConfig {
  name: string;
  state: string;
  status: string;
}

export interface FaqConfig {
  q: string;
  a: string;
}

export interface TestimonialConfig {
  name: string;
  business: string;
  city: string;
  text: string;
  results: string;
  initials: string;
  rating: number;
}

export type SiteProduct =
  Pick<Product, "id" | "name" | "price" | "unit" | "category"> &
  Partial<Omit<Product, "id" | "name" | "price" | "unit" | "category">>;

export interface SiteConfig {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  phoneDisplay: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  heroEyebrow: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  plans: PlanConfig[];
  products: SiteProduct[];
  cities: CityConfig[];
  faqs: FaqConfig[];
  testimonials: TestimonialConfig[];
}

const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: "",
  whatsappDefaultMessage: "Olá! Vim pelo site da CDS Sistemas e quero conhecer o sistema para meu comércio.",
  phoneDisplay: "",
  email: "",
  address: "Cariri - Ceará",
  instagram: "",
  facebook: "",
  youtube: "",
  linkedin: "",
  heroEyebrow: "TECNOLOGIA PARA O COMÉRCIO DO CARIRI",
  heroTitlePrefix: "Inteligência para gerir.",
  heroTitleHighlight: "Tecnologia para crescer.",
  heroDescription: "Do primeiro produto vendido ao fechamento do caixa, a CDS conecta as partes do seu negócio em uma plataforma de gestão.",
  heroStat1Value: "ERP",
  heroStat1Label: "Gestão integrada",
  heroStat2Value: "PDV",
  heroStat2Label: "Frente de caixa integrada",
  heroStat3Value: "360°",
  heroStat3Label: "Gestão do negócio",
  plans: PLANS,
  products: PRODUCTS satisfies SiteProduct[],
  cities: CITIES,
  faqs: FAQS,
  testimonials: TESTIMONIALS,
};

function readInitialProducts(value: unknown): SiteProduct[] {
  if (!Array.isArray(value)) {
    throw new Error("A configuração inicial contém uma lista de produtos inválida.");
  }
  const products: SiteProduct[] = [];
  for (const product of value) {
    if (!isProduct(product)) {
      throw new Error("A configuração inicial contém um produto inválido.");
    }
    products.push(product);
  }
  return products;
}

const BASE_CONFIG: SiteConfig = {
  ...DEFAULT_CONFIG,
  ...STATIC_CONFIG,
  products: readInitialProducts(STATIC_CONFIG.products),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPlanConfig(value: unknown): value is PlanConfig {
  return isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.priceMonthly === "number" && Number.isFinite(value.priceMonthly) &&
    typeof value.priceAnnual === "number" && Number.isFinite(value.priceAnnual) &&
    typeof value.tagline === "string" &&
    typeof value.badge === "string" &&
    Array.isArray(value.features) && value.features.every((feature) => typeof feature === "string") &&
    typeof value.highlight === "boolean" &&
    typeof value.cta === "string";
}

function isProduct(value: unknown): value is SiteProduct {
  return isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.price === "number" &&
    (value.unit === "UN" || value.unit === "KG") &&
    typeof value.category === "string" &&
    (value.code === undefined || typeof value.code === "string") &&
    (value.stock === undefined || typeof value.stock === "number") &&
    (value.minStock === undefined || typeof value.minStock === "number") &&
    (value.barcode === undefined || typeof value.barcode === "string") &&
    (value.cost === undefined || typeof value.cost === "number");
}

function isCity(value: unknown): value is CityConfig {
  return isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.state === "string" &&
    typeof value.status === "string";
}

function isFaq(value: unknown): value is FaqConfig {
  return isRecord(value) && typeof value.q === "string" && typeof value.a === "string";
}

function isTestimonial(value: unknown): value is TestimonialConfig {
  return isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.business === "string" &&
    typeof value.city === "string" &&
    typeof value.text === "string" &&
    typeof value.results === "string" &&
    typeof value.initials === "string" &&
    typeof value.rating === "number" && Number.isFinite(value.rating);
}

function readArray<T>(
  config: Record<string, unknown>,
  key: string,
  fallback: T[],
  isItem: (value: unknown) => value is T,
): T[] {
  const value = config[key];
  if (value === undefined) return fallback;
  if (!Array.isArray(value) || !value.every(isItem)) {
    throw new Error(`A configuração recebida contém uma lista inválida: ${key}.`);
  }
  return value;
}

export function createDefaultSiteConfig(): SiteConfig {
  return {
    ...BASE_CONFIG,
    plans: BASE_CONFIG.plans.map((plan) => ({ ...plan, features: [...plan.features] })),
    products: BASE_CONFIG.products.map((product) => ({ ...product })),
    cities: BASE_CONFIG.cities.map((city) => ({ ...city })),
    faqs: BASE_CONFIG.faqs.map((faq) => ({ ...faq })),
    testimonials: BASE_CONFIG.testimonials.map((testimonial) => ({ ...testimonial })),
  };
}

export function mergeSiteConfig(base: SiteConfig, saved: unknown): SiteConfig {
  if (!isRecord(saved)) {
    throw new Error("A API retornou uma configuração inválida.");
  }

  const stringKeys = [
    "whatsappNumber", "whatsappDefaultMessage", "phoneDisplay", "email", "address",
    "instagram", "facebook", "youtube", "linkedin", "heroEyebrow", "heroTitlePrefix",
    "heroTitleHighlight", "heroDescription", "heroStat1Value", "heroStat1Label",
    "heroStat2Value", "heroStat2Label", "heroStat3Value", "heroStat3Label",
  ] as const;
  const strings: Partial<SiteConfig> = {};
  for (const key of stringKeys) {
    if (saved[key] === undefined) continue;
    if (typeof saved[key] !== "string") {
      throw new Error(`A configuração recebida contém um campo inválido: ${key}.`);
    }
    Object.assign(strings, { [key]: saved[key] });
  }

  return {
    ...base,
    ...strings,
    plans: readArray(saved, "plans", base.plans, isPlanConfig),
    products: readArray(saved, "products", base.products, isProduct),
    cities: readArray(saved, "cities", base.cities, isCity),
    faqs: readArray(saved, "faqs", base.faqs, isFaq),
    testimonials: readArray(saved, "testimonials", base.testimonials, isTestimonial),
  };
}

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (patch: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  getWhatsAppUrl: (customMessage?: string) => string;
  apiState: "loading" | "available" | "unavailable";
  apiError: string;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

function readSavedConfig(): SiteConfig {
  if (typeof window === "undefined") return BASE_CONFIG;
  return createDefaultSiteConfig();
}

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(readSavedConfig);
  const [apiState, setApiState] = useState<"loading" | "available" | "unavailable">("loading");
  const [apiError, setApiError] = useState("");

  React.useEffect(() => {
    let active = true;
    fetch("/api/site-config", { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error(`A API respondeu com HTTP ${response.status}.`);
        return response.json();
      })
      .then((savedConfig) => {
        const merged = mergeSiteConfig(config, savedConfig);
        if (!active) return;
        setConfig(merged);
        setApiState("available");
        setApiError("");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setApiState("unavailable");
        setApiError(cause instanceof Error
          ? cause.message
          : "Não foi possível carregar as configurações do servidor.");
      });
    return () => {
      active = false;
    };
  }, []);

  const updateConfig = (patch: Partial<SiteConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch };
      return next;
    });
  };

  const resetConfig = () => {
    setConfig(createDefaultSiteConfig());
  };

  const getWhatsAppUrl = (customMessage?: string) => {
    return buildWhatsAppLink(
      config.whatsappNumber,
      customMessage || config.whatsappDefaultMessage,
    );
  };

  const value = useMemo(
    () => ({ config, updateConfig, resetConfig, getWhatsAppUrl, apiState, apiError }),
    [config, apiState, apiError],
  );
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  return ctx;
};
