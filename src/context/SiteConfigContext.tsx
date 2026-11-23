import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, PLANS, CITIES, FAQS, TESTIMONIALS, type Product } from "../data";
import STATIC_CONFIG from "../site-config.json";
import { buildWhatsAppAppLink } from "../utils/whatsapp";

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
  products: Product[];
  cities: { name: string; state: string; status: string }[];
  faqs: { q: string; a: string }[];
  testimonials: {
    name: string; business: string; city: string; text: string;
    results: string; initials: string; rating: number;
  }[];
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
  products: PRODUCTS,
  cities: CITIES,
  faqs: FAQS,
  testimonials: TESTIMONIALS,
};

const BASE_CONFIG: SiteConfig = { ...DEFAULT_CONFIG, ...STATIC_CONFIG };

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (patch: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  getWhatsAppUrl: (customMessage?: string) => string;
}

const STORAGE_KEY = "cds-site-config-v2";
const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

function readSavedConfig(): SiteConfig {
  if (typeof window === "undefined") return BASE_CONFIG;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...BASE_CONFIG, ...JSON.parse(saved) } : BASE_CONFIG;
  } catch {
    return BASE_CONFIG;
  }
}

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(readSavedConfig);

  const updateConfig = (patch: Partial<SiteConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* browser storage unavailable */ }
      return next;
    });
  };

  const resetConfig = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setConfig(BASE_CONFIG);
  };

  const getWhatsAppUrl = (customMessage?: string) => {
    return buildWhatsAppAppLink(
      config.whatsappNumber,
      customMessage || config.whatsappDefaultMessage,
    );
  };

  const value = useMemo(() => ({ config, updateConfig, resetConfig, getWhatsAppUrl }), [config]);
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  return ctx;
};
