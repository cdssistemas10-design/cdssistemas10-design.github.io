import { useState, type FormEvent } from "react";
import { CdsLogo } from "./CdsLogo";
import { Button, Reveal } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Sound } from "../utils/sound";

export function FinalCtaSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { config, getWhatsAppUrl } = useSiteConfig();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    business: "",
    city: config.cities[0]?.name || "Juazeiro do Norte",
    segment: "Mercantis & Supermercados",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    Sound.kaching();
    setSubmitted(true);

    const message = `Olá! Meu nome é ${formData.name}, sou do comércio "${formData.business}" em ${formData.city} (Segmento: ${formData.segment}) e gostaria de agendar uma demonstração do sistema CDS Sistemas.`;
    const url = getWhatsAppUrl(message);

    setTimeout(() => {
      window.open(url, "_blank");
    }, 600);
  };

  return (
    <section id="contato" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/40 bg-gradient-to-br from-cyber-900 via-cyber-950 to-cyber-950 p-8 sm:p-12 lg:p-14 shadow-2xl">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px]" />

            <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              {/* Left Column */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1 text-xs font-bold text-gold-300">
                  ✦ Demonstração Sem Compromisso
                </span>

                <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                  Pronto para ver o seu comércio{" "}
                  <span className="text-gold-gradient">vendendo com total controle?</span>
                </h2>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-lg">
                  Agende uma apresentação prática com a CDS Sistemas.
                  Vamos entender a rotina do seu negócio e mostrar os módulos mais importantes para sua operação.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="gold" onClick={onOpenDemo} size="lg">
                    ▶ Abrir Simulador de PDV
                  </Button>
                  <Button
                    variant="glass"
                    href={getWhatsAppUrl()}
                    size="lg"
                  >
                    💬 {config.whatsappNumber ? "Falar no WhatsApp Oficial" : "Solicitar contato"}
                  </Button>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-base sm:text-lg font-black text-gold-300">Implantação</p>
                    <p className="text-[11px] text-slate-400">Acompanhada</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-black text-gold-300">Treinamento</p>
                    <p className="text-[11px] text-slate-400">Da equipe</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-black text-gold-300">Suporte</p>
                    <p className="text-[11px] text-slate-400">Próximo do cliente</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="glass-card rounded-2xl border border-gold-500/30 p-6 sm:p-8">
                <p className="text-sm font-black text-white">Solicitar Demonstração Grátis</p>
                <p className="text-xs text-slate-400 mt-1">Preencha e retornamos em instantes pelo WhatsApp.</p>

                {submitted ? (
                  <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
                    <p className="text-3xl">✅</p>
                    <p className="text-sm font-bold text-white">Solicitação Enviada!</p>
                    <p className="text-xs text-slate-300">
                      Abrindo conversa no WhatsApp para atendimento imediato...
                    </p>
                    <Button
                      variant="gold"
                      href={getWhatsAppUrl(`Olá! Sou ${formData.name} do comércio ${formData.business} e aguardo retorno.`)}
                      className="mt-3 w-full"
                    >
                      Abrir WhatsApp Agora
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                    <div>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu Nome Completo"
                        className="w-full rounded-xl border border-white/10 bg-cyber-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="WhatsApp (DDD + Número)"
                        className="w-full rounded-xl border border-white/10 bg-cyber-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        required
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                        placeholder="Nome do seu Comércio"
                        className="w-full rounded-xl border border-white/10 bg-cyber-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-gold-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="rounded-xl border border-white/10 bg-cyber-950 px-2.5 py-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                      >
                        {config.cities.map((c) => (
                          <option key={c.name} value={c.name} className="bg-cyber-900">
                            {c.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={formData.segment}
                        onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                        className="rounded-xl border border-white/10 bg-cyber-950 px-2.5 py-2.5 text-xs text-white focus:border-gold-400 focus:outline-none"
                      >
                        <option value="Mercantis & Supermercados" className="bg-cyber-900">Mercantis</option>
                        <option value="Mercadinhos de Bairro" className="bg-cyber-900">Mercadinhos</option>
                        <option value="Lojas & Varejo" className="bg-cyber-900">Lojas</option>
                        <option value="Depósitos de Construção" className="bg-cyber-900">Depósitos</option>
                        <option value="Açougues & Casas de Carnes" className="bg-cyber-900">Açougues</option>
                        <option value="Padarias & Confeitarias" className="bg-cyber-900">Padarias</option>
                        <option value="Distribuidoras de Bebidas" className="bg-cyber-900">Distribuidoras</option>
                        <option value="Outro Segmento" className="bg-cyber-900">Outro</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      variant="gold"
                      className="w-full py-3 text-xs sm:text-sm font-black"
                    >
                      Agendar Demonstração no WhatsApp →
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { config, getWhatsAppUrl } = useSiteConfig();

  return (
    <>
    <button
      type="button"
      onClick={onOpenAdmin}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+11rem)] right-3 z-[45] rounded-full border border-gold-500/40 bg-cyber-950 px-3 py-2 text-[10px] font-bold text-slate-200 shadow-xl shadow-black/50 backdrop-blur-sm transition hover:border-gold-400 hover:text-gold-300 sm:right-5"
      aria-label="Abrir configuração do site"
    >
      ⚙ Configuração do site
    </button>
    <footer className="border-t border-gold-500/20 bg-cyber-950 pt-16 pb-12">
      <div className="container-x grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand Column with exact logo */}
        <div>
          <CdsLogo size="lg" showTagline />
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
            Sistema inteligente de Frente de Caixa (PDV), emissão de Cupom Fiscal NFC-e,
            controle de estoque, crediário e gestão financeira para negócios no Cariri.
          </p>

          <div className="mt-5 text-xs text-slate-400 space-y-1">
            {config.address && <p>📍 {config.address}</p>}
            {config.phoneDisplay && <p>📞 {config.phoneDisplay}</p>}
            {config.email && <p>✉️ {config.email}</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Instagram", config.instagram],
              ["Facebook", config.facebook],
              ["YouTube", config.youtube],
              ["LinkedIn", config.linkedin],
            ].filter(([, url]) => Boolean(url)).map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:border-gold-400 hover:text-gold-300">{name} ↗</a>
            ))}
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Sistema</p>
          <ul className="mt-4 space-y-2 text-xs text-slate-400">
            <li><a href="#pilares" className="hover:text-gold-300 transition">8 Pilares Oficiais</a></li>
            <li><a href="#modulos" className="hover:text-gold-300 transition">Módulos Integrados</a></li>
            <li><a href="#demo-pdv" className="hover:text-gold-300 transition">Simulador PDV</a></li>
            <li><a href="#comparativo" className="hover:text-gold-300 transition">Como Funciona</a></li>
            <li><a href="#planos" className="hover:text-gold-300 transition">Tabela de Planos</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Soluções</p>
          <ul className="mt-4 space-y-2 text-xs text-slate-400">
            <li><a href="#segmentos" className="hover:text-gold-300 transition">Mercantis & Mercadinhos</a></li>
            <li><a href="#segmentos" className="hover:text-gold-300 transition">Lojas de Varejo</a></li>
            <li><a href="#segmentos" className="hover:text-gold-300 transition">Depósitos de Construção</a></li>
            <li><a href="#segmentos" className="hover:text-gold-300 transition">Açougues & Padarias</a></li>
            <li><a href="#regiao-cariri" className="hover:text-gold-300 transition">Cidades do Cariri</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Atendimento</p>
          <ul className="mt-4 space-y-2 text-xs text-slate-400">
            {config.whatsappNumber && <li><a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">💬 WhatsApp Oficial</a></li>}
            <li><a href="#duvidas" className="hover:text-gold-300 transition">Perguntas Frequentes</a></li>
            <li><a href="#contato" className="hover:text-gold-300 transition">Pedir Demonstração</a></li>
          </ul>
        </div>
      </div>

      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <p className="text-[10px] text-slate-500">© {new Date().getFullYear()} CDS Sistemas. Todos os direitos reservados.</p>
      </div>
    </footer>
    </>
  );
}

export function FloatingWhatsAppWidget() {
  const { config, getWhatsAppUrl } = useSiteConfig();

  return (
    <a
      href={getWhatsAppUrl()}
      target={config.whatsappNumber ? "_blank" : undefined}
      rel="noreferrer"
      onClick={() => Sound.click()}
      className="group fixed bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] right-3 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-2 pl-2 pr-3 font-black text-[#042814] shadow-2xl shadow-black/80 transition-all duration-300 hover:scale-105 hover:brightness-110 sm:right-5 sm:gap-3 sm:py-2.5 sm:pr-4"
      aria-label="Falar no WhatsApp da CDS Sistemas"
    >
      <img
        src={`${import.meta.env.BASE_URL}images/whatsapp-logo.png`}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
      />
      <div className="hidden sm:block text-left leading-tight">
        <p className="text-xs font-black">Falar no WhatsApp</p>
        <p className="text-[10px] font-semibold text-emerald-950">Atendimento no Cariri</p>
      </div>
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
    </a>
  );
}
