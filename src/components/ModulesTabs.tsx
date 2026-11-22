import { useState } from "react";
import { MODULES } from "../data";
import { Button, Reveal, SectionHeader } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

export default function ModulesTabs({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { getWhatsAppUrl } = useSiteConfig();
  const [activeTab, setActiveTab] = useState(MODULES[0].id);

  const activeModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];

  const handleSelectTab = (id: string) => {
    Sound.click();
    setActiveTab(id);
  };

  return (
    <section id="modulos" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Módulos Integrados"
            title={
              <>
                Tudo o que a sua rotina exige,{" "}
                <span className="text-gold-gradient">sem complicação</span>
              </>
            }
            subtitle="Explore as principais ferramentas integradas da CDS Sistemas. Chega de usar 3 programas diferentes e planilhas que não batem."
          />
        </Reveal>

        {/* Tab Navigation Buttons */}
        <div className="mt-12 flex flex-wrap items-stretch justify-center gap-2 pb-2">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => handleSelectTab(mod.id)}
              aria-pressed={activeTab === mod.id}
              className={cn(
                "flex min-w-0 max-w-full flex-1 basis-[220px] items-center justify-center gap-2.5 rounded-xl border px-3 py-3 text-center text-xs font-bold leading-snug transition-all duration-200 sm:flex-none sm:px-4 sm:text-sm",
                activeTab === mod.id
                  ? "border-gold-400 bg-gold-500/15 text-gold-300 shadow-lg shadow-gold-500/15"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span className="shrink-0">{mod.icon}</span>
              <span className="min-w-0 whitespace-normal">{mod.tab}</span>
            </button>
          ))}
        </div>

        {/* Active Module Showcase Card */}
        <div className="mt-8">
          <Reveal key={activeModule.id}>
            <div className="glass-card relative overflow-hidden rounded-3xl border border-gold-500/25 p-6 sm:p-10 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                {/* Left: Info & features */}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500/20 text-2xl text-gold-300 border border-gold-500/30">
                      {activeModule.icon}
                    </span>
                    <div>
                      <span className="rounded-full bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300 border border-gold-500/20">
                        {activeModule.metric}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                    {activeModule.headline}
                  </h3>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
                    {activeModule.desc}
                  </p>

                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {activeModule.features.map((feat) => (
                      <div
                        key={feat}
                        className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs sm:text-sm text-slate-200"
                      >
                        <span className="mt-0.5 text-gold-400 font-bold shrink-0">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button variant="gold" onClick={onOpenDemo}>
                      ▶ Testar este módulo no PDV
                    </Button>
                    <Button
                      variant="glass"
                      href={getWhatsAppUrl(`Olá! Gostaria de saber mais detalhes sobre o módulo ${activeModule.tab} da CDS Sistemas.`)}
                    >
                      Dúvidas sobre {activeModule.tab}
                    </Button>
                  </div>
                </div>

                {/* Right: Interactive High-Tech Simulation Visual */}
                <div className="rounded-2xl border border-gold-500/30 bg-cyber-900/90 p-5 shadow-2xl">
                  {/* Mock Visual specific to active module */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
                      <span className="text-xs font-bold text-slate-200">CDS {activeModule.tab}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gold-300">MOD-STATUS: PRONTO</span>
                  </div>

                  {activeTab === "pdv" && (
                    <div className="mt-4 space-y-3 font-mono text-xs">
                      <div className="rounded-xl border border-white/10 bg-cyber-950 p-3">
                        <p className="text-[10px] text-slate-500">ÚLTIMO ITEM BIPADO (F2)</p>
                        <p className="text-sm font-bold text-white">789100012345 · ARROZ TIPO 1 5KG</p>
                        <p className="text-xs text-gold-300">QTD: 2 UN × R$ 24,90 = R$ 49,80</p>
                      </div>
                      <div className="flex justify-between rounded-lg bg-gold-500/10 p-2.5 text-gold-200 font-bold">
                        <span>TOTAL DA VENDA (F4)</span>
                        <span className="text-base text-white">R$ 138,40</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded border border-white/10 bg-white/5 p-2 text-center text-slate-300">F2: Buscar Produto</div>
                        <div className="rounded border border-gold-500/30 bg-gold-500/10 p-2 text-center text-gold-300">F4: Pagamento</div>
                      </div>
                    </div>
                  )}

                  {activeTab === "nfce" && (
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>✓</span> NFC-e Autorizada pela SEFAZ-CE
                        </p>
                        <p className="text-[11px] font-mono text-slate-300 mt-1 break-all">
                          Chave: 2326 0400 0000 0001 5565 0010 0000 1042 1000 0000 01042
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-cyber-950 p-3 text-slate-300">
                        <p className="text-[11px] text-slate-400">Tempo de Resposta SEFAZ:</p>
                        <p className="text-lg font-black text-white font-mono">1.18 segundos</p>
                        <p className="text-[10px] text-slate-500">Contingência offline automática pronta</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "estoque" && (
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-red-300">
                        <span>⚠️ Feijão Carioca 1kg (6 UN restantes)</span>
                        <span className="font-bold">Abaixo do mín. (12)</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-emerald-300">
                        <span>✓ Arroz Branco 5kg (48 UN restantes)</span>
                        <span className="font-bold">Curva A (Alto giro)</span>
                      </div>
                      <div className="p-2.5 text-slate-400 text-[11px] rounded bg-white/5">
                        Sugestão de compra gerada: +24 fardos para o fim de semana.
                      </div>
                    </div>
                  )}

                  {activeTab === "financeiro" && (
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <p className="text-[10px] text-slate-400">Entradas Hoje</p>
                          <p className="text-sm font-bold text-emerald-400">+ R$ 4.820,00</p>
                        </div>
                        <div className="rounded-lg bg-white/5 p-2.5">
                          <p className="text-[10px] text-slate-400">Contas a Pagar</p>
                          <p className="text-sm font-bold text-slate-300">R$ 1.250,00</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-gold-500/30 bg-gold-500/10 p-2.5">
                        <p className="text-[10px] text-gold-300">Lucro Líquido Estimado do Mês</p>
                        <p className="text-base font-black text-white">R$ 18.940,00</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "crediario" && (
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="rounded-xl border border-white/10 bg-cyber-950 p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">Cliente: Maria das Graças</span>
                          <span className="text-emerald-400 text-[11px]">Limite: R$ 500,00</span>
                        </div>
                        <p className="text-slate-400 mt-1">Saldo devedor: R$ 142,50 (Vence em 3 dias)</p>
                      </div>
                      <button className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2">
                        <span>💬 Enviar Extrato + Chave Pix no WhatsApp</span>
                      </button>
                    </div>
                  )}

                  {activeTab === "mobile" && (
                    <div className="mt-4 space-y-2.5 text-xs text-center">
                      <div className="p-4 rounded-xl border border-gold-500/20 bg-cyber-950">
                        <p className="text-2xl">📱</p>
                        <p className="font-bold text-white mt-1">App CDS Mobile Conectado</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          3 Caixas abertos · 142 clientes atendidos hoje
                        </p>
                        <p className="text-xs text-gold-300 font-bold mt-2">Atualizado há 5 segundos</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
