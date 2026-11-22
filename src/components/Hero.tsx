import { useSiteConfig } from "../context/SiteConfigContext";
import { Button } from "./ui";

export default function Hero() {
  const { getWhatsAppUrl } = useSiteConfig();

  return (
    <section id="inicio" className="relative overflow-hidden pt-16 pb-10 sm:pt-20 sm:pb-14">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-[38rem] w-[38rem] rounded-full bg-gold-500/15 blur-[150px]" />
        <div className="absolute left-[-10rem] top-[-5rem] h-[30rem] w-[30rem] rounded-full bg-gold-600/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(234,179,8,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.18) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, #000 35%, transparent 100%)",
          }}
        />
      </div>

      <div className="container-x">
        <div className="mx-auto w-full max-w-[1248px]">
          <div className="relative w-full overflow-hidden rounded-2xl border border-gold-500/30 bg-transparent shadow-2xl shadow-black/60">
            <img
              src={`${import.meta.env.BASE_URL}images/cds-hero-principal.png`}
              alt="CDS Sistemas: plataforma inteligente de gestão, módulos do sistema, monitor e atendimento"
              className="block h-auto w-full"
              fetchPriority="high"
            />
            <a
              href="#/solucoes"
              aria-label="Conheça a CDS Sistemas: ver soluções e módulos"
              title="Conheça a CDS Sistemas"
              className="absolute left-[4.5%] top-[79.5%] h-[9%] w-[26%] rounded-full outline-none transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-gold-300"
            />
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="gold"
              size="lg"
              href="#/solucoes"
              className="w-full px-7 py-3.5 text-sm shadow-xl shadow-gold-500/25 sm:w-auto sm:text-base"
            >
              ▶ Conhecer o sistema
            </Button>
            <Button
              variant="dark"
              size="lg"
              href={getWhatsAppUrl("Olá! Conheci a CDS Sistemas pelo site e gostaria de solicitar uma demonstração.")}
              className="w-full border border-white/15 px-6 py-3.5 text-sm hover:border-gold-400/50 sm:w-auto sm:text-base"
            >
              Falar com a equipe CDS →
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            Gestão comercial para acompanhar vendas, estoque, financeiro e rotinas fiscais em um só lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
