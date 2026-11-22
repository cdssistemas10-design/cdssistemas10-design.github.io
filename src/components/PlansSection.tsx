import { useSiteConfig } from "../context/SiteConfigContext";
import { Button, Reveal, SectionHeader } from "./ui";
import { cn } from "../utils/cn";

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PlansSection() {
  const { config, getWhatsAppUrl } = useSiteConfig();
  const plans = config.plans || [];

  return (
    <section id="planos" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Planos Transparentes"
            title={
              <>
                Escolha como deseja{" "}
                <span className="text-gold-gradient">contratar a CDS</span>
              </>
            }
            subtitle="Compare as condições de cobrança mensal e anual. Os recursos do plano permanecem os mesmos; muda o período de contratação."
          />
        </Reveal>

        <div className="mt-12 space-y-8">
          {plans.map((plan, idx) => {
            const monthly = Number(plan.priceMonthly) || 0;
            const annualEquivalent = Number(plan.priceAnnual) || 0;
            const annualTotal = annualEquivalent * 12;
            const monthlyTotalForYear = monthly * 12;
            const savings = Math.max(0, monthlyTotalForYear - annualTotal);
            const features = plan.features || [];

            return (
              <Reveal key={plan.name} delay={idx * 100}>
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Monthly billing */}
                  <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Cobrança mensal
                      </span>
                      <span className="text-xs font-semibold text-slate-500">Mais flexibilidade</span>
                    </div>
                    <h3 className="mt-5 text-xl font-black text-white">{plan.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{plan.tagline}</p>

                    <div className="mt-7 border-b border-white/10 pb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor por mês</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">R$</span>
                        <span className="font-mono text-4xl font-black tracking-tight text-white">{brl(monthly)}</span>
                        <span className="text-sm text-slate-400">/mês</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Cobrança mês a mês.</p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300 sm:text-sm">
                          <span className="mt-0.5 shrink-0 font-bold text-gold-400">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 border-t border-white/5 pt-5">
                      <Button
                        variant="glass"
                        href={getWhatsAppUrl(`Olá! Tenho interesse no ${plan.name} com cobrança mensal de R$ ${brl(monthly)} e gostaria de saber as condições.`)}
                        className="w-full py-3.5 text-xs font-bold sm:text-sm"
                      >
                        Consultar plano mensal
                      </Button>
                    </div>
                  </article>

                  {/* Annual billing */}
                  <article
                    className={cn(
                      "relative flex h-full flex-col rounded-3xl border p-6 sm:p-8",
                      plan.highlight
                        ? "border-gold-400/70 bg-gradient-to-b from-gold-500/10 via-cyber-900 to-cyber-950 shadow-[0_0_35px_-15px_rgba(234,179,8,0.45)]"
                        : "border-gold-500/30 bg-gold-500/[0.04]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gold-300">
                        Cobrança anual
                      </span>
                      {savings > 0 ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black text-emerald-300">
                          Economize R$ {brl(savings)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gold-300">12 meses</span>
                      )}
                    </div>
                    <h3 className="mt-5 text-xl font-black text-white">{plan.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{plan.tagline}</p>

                    <div className="mt-7 border-b border-gold-500/15 pb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Equivalente por mês</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">R$</span>
                        <span className="font-mono text-4xl font-black tracking-tight text-white">{brl(annualEquivalent)}</span>
                        <span className="text-sm text-slate-400">/mês</span>
                      </div>
                      <div className="mt-3 rounded-xl border border-gold-500/20 bg-black/20 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">Total em 12 meses</p>
                        <p className="mt-1 text-2xl font-black text-white">R$ {brl(annualTotal)}</p>
                        <p className="mt-1 text-[11px] text-slate-400">Valor anual calculado a partir da condição cadastrada.</p>
                      </div>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300 sm:text-sm">
                          <span className="mt-0.5 shrink-0 font-bold text-gold-400">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 border-t border-gold-500/15 pt-5">
                      <Button
                        variant="gold"
                        href={getWhatsAppUrl(`Olá! Tenho interesse no ${plan.name} com cobrança anual. O valor equivalente é R$ ${brl(annualEquivalent)} por mês, totalizando R$ ${brl(annualTotal)} em 12 meses. Gostaria de confirmar as condições.`)}
                        className="w-full py-3.5 text-xs font-bold sm:text-sm"
                      >
                        Consultar plano anual
                      </Button>
                    </div>
                  </article>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-gold-500/20 bg-cyber-900/60 p-6 text-center">
          <p className="text-xs font-semibold leading-relaxed text-slate-300 sm:text-sm">
            <strong className="font-bold text-gold-300">Quer entender qual condição faz mais sentido?</strong>{" "}
            Converse com a equipe CDS para confirmar implantação, configuração e condições comerciais do seu negócio.
          </p>
        </div>
      </div>
    </section>
  );
}
