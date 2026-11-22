import { useState } from "react";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Button, Reveal, SectionHeader } from "./ui";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

export default function RegionCariri() {
  const { config, getWhatsAppUrl } = useSiteConfig();
  const cities = config.cities || [];
  const [selectedCity, setSelectedCity] = useState(cities[0] || { name: "Juazeiro do Norte", state: "CE", status: "Atendimento Presencial" });

  const handleSelectCity = (c: typeof cities[0]) => {
    Sound.click();
    setSelectedCity(c);
  };

  return (
    <section id="regiao-cariri" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Atendimento Regional"
            title={
              <>
                Nascida e presente no{" "}
                <span className="text-gold-gradient">coração do Cariri</span>
              </>
            }
            subtitle="Diferente de sistemas de outros estados que só atendem por robôs, a CDS Sistemas está perto do seu comércio com visita presencial e suporte ágil."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* Left: Interactive Cities Grid */}
          <Reveal>
            <div className="rounded-3xl border border-gold-500/20 bg-cyber-900/80 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-gold-300">
                Cidades Atendidas com Prioridade
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                {cities.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSelectCity(c)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                      selectedCity.name === c.name
                        ? "border-gold-400 bg-gold-500/20 text-gold-200 shadow-md scale-[1.01]"
                        : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]"
                    )}
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400">({c.state})</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.status}</p>
                    </div>
                    <span className="text-xs text-gold-400 font-bold ml-2">✓</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right: Selected City Action Card */}
          <Reveal delay={120}>
            <div className="glass-card rounded-3xl border border-gold-500/30 p-6 sm:p-8 text-center sm:text-left">
              <span className="inline-block rounded-full bg-gold-500/10 border border-gold-500/30 px-3 py-1 text-xs font-bold text-gold-300">
                📍 {selectedCity.name} - {selectedCity.state}
              </span>

              <h3 className="mt-4 text-xl font-black text-white">
                Atendimento Rápido e Visita Técnica
              </h3>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                Atendemos comerciantes de <strong>{selectedCity.name}</strong> com suporte direto no WhatsApp,
                implantação assistida e configuração completa de certificado digital NFC-e.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-gold-400 font-bold">✓</span>
                  <span>Sem filas de espera de call center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-400 font-bold">✓</span>
                  <span>Adequado às regras fiscais da SEFAZ Ceará</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-400 font-bold">✓</span>
                  <span>Equipe pronta para visitar seu balcão</span>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  variant="gold"
                  href={getWhatsAppUrl(`Olá! Tenho um comércio em ${selectedCity.name}/${selectedCity.state} e gostaria de agendar uma visita/demonstração da CDS Sistemas.`)}
                  className="w-full py-3.5 text-xs sm:text-sm font-bold"
                >
                  Solicitar Atendimento em {selectedCity.name}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
