import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhoWeAreSection from "./components/WhoWeAreSection";
import PillarsSection from "./components/PillarsSection";
import ModulesTabs from "./components/ModulesTabs";
import { ComparisonSection } from "./components/ComparisonSection";
import { HardwareSection } from "./components/HardwareSection";
import SegmentsSection from "./components/SegmentsSection";
import PlansSection from "./components/PlansSection";
import RegionCariri from "./components/RegionCariri";
import TestimonialsFaq from "./components/TestimonialsFaq";
import { FinalCtaSection, Footer, FloatingWhatsAppWidget } from "./components/CtaFooter";
import PdvDemo from "./components/PdvDemo";
import AdminConfig from "./components/AdminConfig";
import { CyberCanvas } from "./components/CyberCanvas";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { Button, Reveal } from "./components/ui";
import { buildWhatsAppWebFallback, launchWhatsApp } from "./utils/whatsapp";

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="container-x pb-2 pt-32 sm:pt-36"><Reveal><p className="text-xs font-black uppercase tracking-[.22em] text-gold-300">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-3xl font-black text-white sm:text-5xl">{title}</h1><p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300">{description}</p></Reveal></section>;
}

function MainApp() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [whatsAppFallbackUrl, setWhatsAppFallbackUrl] = useState("");
  const [route, setRoute] = useState(window.location.hash.replace(/^#/, "") || "/");
  const handleOpenDemo = () => setDemoOpen(true);

  useEffect(() => {
    const syncRoute = () => {
      setRoute(window.location.hash.replace(/^#/, "") || "/");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const showFallback = (event: Event) => {
      const { appUrl } = (event as CustomEvent<{ appUrl: string }>).detail;
      setWhatsAppFallbackUrl(buildWhatsAppWebFallback(appUrl) === "#contato" ? "" : appUrl);
    };
    const launchFromLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href^="whatsapp://send?"]');
      if (!link) return;
      event.preventDefault();
      launchWhatsApp(link.href);
    };

    window.addEventListener("whatsapp:launch", showFallback);
    document.addEventListener("click", launchFromLink, true);
    return () => {
      window.removeEventListener("whatsapp:launch", showFallback);
      document.removeEventListener("click", launchFromLink, true);
    };
  }, []);

  const page = (() => {
    switch (route) {
      case "/solucoes":
        return <><PageIntro eyebrow="Soluções CDS" title="Gestão integrada para acompanhar cada parte do seu negócio" description="Conheça os módulos da CDS Sistemas e veja como vendas, estoque, compras, financeiro e rotinas fiscais podem trabalhar de forma conectada."/><PillarsSection/><ModulesTabs onOpenDemo={handleOpenDemo}/><ComparisonSection onOpenDemo={handleOpenDemo}/><HardwareSection/></>;
      case "/segmentos":
        return <><PageIntro eyebrow="Segmentos atendidos" title="Uma gestão preparada para diferentes tipos de comércio" description="Conheça como a CDS Sistemas pode apoiar a rotina de mercadinhos, lojas, depósitos e outros negócios do varejo."/><SegmentsSection onOpenDemo={handleOpenDemo}/><RegionCariri/></>;
      case "/demonstracao":
        return <><PageIntro eyebrow="Demonstração" title="Veja a experiência da CDS Sistemas na prática" description="Explore uma demonstração interativa do frente de caixa e conheça as principais rotinas do sistema."/><section className="container-x py-12"><div className="glass-gold rounded-3xl border border-gold-500/30 p-8 text-center sm:p-12"><h2 className="text-2xl font-black text-white sm:text-4xl">Experimente o simulador de PDV</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">Uma demonstração ilustrativa para conhecer a navegação e algumas rotinas de operação.</p><div className="mt-7"><Button variant="gold" size="lg" onClick={handleOpenDemo}>Abrir demonstração do PDV →</Button></div></div></section><TestimonialsFaq/></>;
      case "/planos":
        return <><PageIntro eyebrow="Planos e contratação" title="Encontre a melhor forma de contratar a CDS" description="Consulte as condições disponíveis e converse com nossa equipe para confirmar o plano, a implantação e os recursos adequados à sua operação."/><PlansSection/></>;
      case "/quem-somos":
        return <><PageIntro eyebrow="Quem somos" title="Tecnologia com propósito. Gestão que transforma." description="Conheça a empresa, o propósito e os princípios que orientam o desenvolvimento das soluções CDS."/><WhoWeAreSection/></>;
      case "/contato":
        return <><PageIntro eyebrow="Fale com a CDS" title="Vamos entender a necessidade do seu negócio" description="Entre em contato com nossa equipe para tirar dúvidas, solicitar uma apresentação ou conversar sobre implantação."/><FinalCtaSection onOpenDemo={handleOpenDemo}/><RegionCariri/></>;
      default:
        return <><Hero /><section className="container-x py-14">
          <div className="grid gap-5 md:grid-cols-3"><a href="#/solucoes"
           className="glass-card rounded-2xl border border-gold-500/25 p-6 transition hover:border-gold-400">
            <p className="text-sm font-bold text-gold-300">01 · Soluções</p>
            <h2 className="mt-2 text-xl font-black text-white">Conheça os módulos</h2>
            <p className="mt-2 text-sm text-slate-400">Veja como a plataforma organiza as rotinas da empresa.</p>
            </a><a href="#/segmentos" className="glass-card rounded-2xl border border-gold-500/25 p-6 transition hover:border-gold-400">
            <p className="text-sm font-bold text-gold-300">02 · Segmentos</p>
            <h2 className="mt-2 text-xl font-black text-white">Para o seu tipo de negócio</h2><p className="mt-2 text-sm text-slate-400">Descubra como a CDS atende diferentes operações comerciais.</p></a><a href="#/demonstracao" className="glass-card rounded-2xl border border-gold-500/25 p-6 transition hover:border-gold-400"><p className="text-sm font-bold text-gold-300">03 · Demonstração</p><h2 className="mt-2 text-xl font-black text-white">Veja funcionando</h2><p className="mt-2 text-sm text-slate-400">
              Acesse uma demonstração interativa do PDV.</p></a></div></section><WhoWeAreSection/><PlansSection/><FinalCtaSection onOpenDemo={handleOpenDemo}/></>;
    }
  })();

  const webFallbackUrl = whatsAppFallbackUrl ? buildWhatsAppWebFallback(whatsAppFallbackUrl) : "";

  return <div className="relative min-h-screen overflow-x-hidden bg-cyber-950 font-sans text-slate-200"><CyberCanvas/><Header onOpenDemo={handleOpenDemo}/><main className="relative z-10">{page}</main><Footer onOpenAdmin={() => setAdminOpen(true)}/><FloatingWhatsAppWidget/><PdvDemo open={demoOpen} onClose={() => setDemoOpen(false)}/><AdminConfig open={adminOpen} onClose={() => setAdminOpen(false)}/>{webFallbackUrl&&<aside role="status" aria-live="polite" className="fixed bottom-4 left-4 z-[140] w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-white/15 bg-cyber-900 p-4 text-sm text-white shadow-2xl"><button type="button" onClick={()=>setWhatsAppFallbackUrl("")} aria-label="Fechar alternativas do WhatsApp" className="absolute right-3 top-2 text-slate-400 hover:text-white">×</button><p className="pr-5 font-bold">Se o WhatsApp não abriu:</p><div className="mt-3 flex flex-wrap gap-2"><a href={whatsAppFallbackUrl} className="rounded-lg border border-emerald-400/40 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-400/10">Abrir WhatsApp novamente</a><a href={webFallbackUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-cyber-950 hover:bg-emerald-400">Continuar pelo WhatsApp Web</a></div></aside>}</div>;
}

export default function App() {
  return <SiteConfigProvider><MainApp/></SiteConfigProvider>;
}
