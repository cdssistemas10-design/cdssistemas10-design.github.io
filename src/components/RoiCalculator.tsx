import { useState } from "react";
import { Button, Reveal, SectionHeader, brl } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Sound } from "../utils/sound";

export default function RoiCalculator() {
  const { getWhatsAppUrl } = useSiteConfig();
  const [faturamento, setFaturamento] = useState(45000);
  const [vendasDia, setVendasDia] = useState(80);
  const [tempoFila, setTempoFila] = useState(4); // minutes

  // Calculated gains
  const horasPoupadasMes = Math.round((vendasDia * 25 * (tempoFila * 0.6)) / 60);
  const economiaQuebraFiado = Math.round(faturamento * 0.024); // ~2.4% recovered
  const ganhoVendasFila = Math.round(faturamento * 0.045); // ~4.5% fewer abandoned carts
  const ganhoTotalMes = economiaQuebraFiado + ganhoVendasFila;
  const ganhoTotalAno = ganhoTotalMes * 12;

  const handleSliderChange = (setter: (v: number) => void, val: number) => {
    Sound.click();
    setter(val);
  };

  return (
    <section id="calculadora-roi" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Calculadora de Retorno"
            title={
              <>
                Descubra quanto dinheiro o seu comércio{" "}
                <span className="text-gold-gradient">pode economizar</span>
              </>
            }
            subtitle="Simule o impacto da automação no balcão, fim do fiado no caderno e controle rigoroso de estoque na sua operação diária."
          />
        </Reveal>

        <div className="mt-14">
          <Reveal delay={100}>
            <div className="glass-card overflow-hidden rounded-3xl border border-gold-500/30 p-6 sm:p-10 lg:p-12">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* Left: Interactive Sliders */}
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-200">
                        Faturamento Mensal Estimado
                      </label>
                      <span className="text-base font-black text-gold-300 font-mono">
                        {brl(faturamento)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={250000}
                      step={5000}
                      value={faturamento}
                      onChange={(e) => handleSliderChange(setFaturamento, Number(e.target.value))}
                      className="mt-3 w-full accent-gold-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>R$ 10.000</span>
                      <span>R$ 120.000</span>
                      <span>R$ 250.000+</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-200">
                        Atendimentos / Vendas por Dia
                      </label>
                      <span className="text-base font-black text-gold-300 font-mono">
                        {vendasDia} clientes/dia
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={350}
                      step={10}
                      value={vendasDia}
                      onChange={(e) => handleSliderChange(setVendasDia, Number(e.target.value))}
                      className="mt-3 w-full accent-gold-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>20 vendas</span>
                      <span>150 vendas</span>
                      <span>350+ vendas</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-200">
                        Tempo Médio de Espera Atual no Caixa
                      </label>
                      <span className="text-base font-black text-gold-300 font-mono">
                        {tempoFila} minutos
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={tempoFila}
                      onChange={(e) => handleSliderChange(setTempoFila, Number(e.target.value))}
                      className="mt-3 w-full accent-gold-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>1 min (rápido)</span>
                      <span>5 min (médio)</span>
                      <span>10 min (fila longa)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Calculated Financial Return Cards */}
                <div className="rounded-2xl border border-gold-500/30 bg-cyber-900/90 p-6 sm:p-8">
                  <span className="rounded-full border border-gold-400/30 bg-gold-500/10 px-3 py-1 text-xs font-bold text-gold-300">
                    ⚡ Retorno Estimado para o seu Comércio
                  </span>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Tempo de Caixa Economizado</p>
                        <p className="text-lg font-black text-white">{horasPoupadasMes} horas/mês</p>
                      </div>
                      <span className="text-2xl">⏱️</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Recuperação de Fiado & Quebra de Caixa</p>
                        <p className="text-lg font-black text-emerald-400">+{brl(economiaQuebraFiado)}/mês</p>
                      </div>
                      <span className="text-2xl">🛡️</span>
                    </div>

                    <div className="rounded-xl border border-gold-500/40 bg-gold-500/10 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-gold-300">
                        Ganho Financeiro Total Estimado
                      </p>
                      <p className="mt-1 text-3xl font-black text-white sm:text-4xl">
                        +{brl(ganhoTotalMes)}
                        <span className="text-sm font-semibold text-slate-400"> /mês</span>
                      </p>
                      <p className="mt-1 text-xs text-gold-400 font-semibold">
                        Ou aproximadamente <strong className="text-white">{brl(ganhoTotalAno)}</strong> a mais por ano na sua empresa!
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="gold"
                      href={getWhatsAppUrl(`Olá! Simulei na calculadora um faturamento de ${brl(faturamento)} com ${vendasDia} vendas/dia e gostaria de agendar uma demonstração.`)}
                      className="w-full py-3.5 text-sm"
                    >
                      Solicitar Estudo para meu Comércio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
