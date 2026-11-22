import { Reveal, SectionHeader, Button } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";

export function ComparisonSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { getWhatsAppUrl } = useSiteConfig();

  const comparisonRows = [
    {
      feature: "Velocidade no Caixa (PDV)",
      legacy: "Filas demoradas, digitação manual lenta e travamentos nos horários de pico.",
      cds: "Atendimento em menos de 3 segundos por cliente com atalhos F2 a F12 e leitura rápida.",
    },
    {
      feature: "Emissão de Cupom Fiscal NFC-e",
      legacy: "Sistema trava quando a internet cai ou a SEFAZ oscila, parando a loja.",
      cds: "Contingência offline automática que continua emitindo e sincroniza quando a rede volta.",
    },
    {
      feature: "Controle de Fiado / Crediário",
      legacy: "Caderno de papel rasurado, contas esquecidas e prejuízo no fim do mês.",
      cds: "Limite de crédito pré-definido, extrato assinado e cobrança educada via WhatsApp em 1 clique.",
    },
    {
      feature: "Controle de Estoque & Ruptura",
      legacy: "Falta mercadoria no sábado ou vence produto na prateleira sem você saber.",
      cds: "Curva ABC automática, alertas de estoque crítico e importação de XML de compras.",
    },
    {
      feature: "Fechamento de Caixa",
      legacy: "Horas conferindo papelzinhos e quebras de caixa sem saber quem errou.",
      cds: "Fechamento cego com auditoria por operador, conferência de sangrias e zero furo.",
    },
    {
      feature: "Suporte Técnico",
      legacy: "Atendimento por robô ou ligação para outro estado que demora dias para responder.",
      cds: "Atendimento humanizado rápido no WhatsApp e equipe presencial no Cariri.",
    },
  ];

  return (
    <section id="comparativo" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Comparativo Direto"
            title={
              <>
                Caderno & Sistemas Antigos{" "}
                <span className="text-gold-gradient">vs. CDS Sistemas</span>
              </>
            }
            subtitle="Veja por que mais de 300 comércios no Cariri trocaram a dor de cabeça diária pela tranquilidade do nosso sistema."
          />
        </Reveal>

        <div className="mt-14 overflow-hidden rounded-3xl border border-gold-500/30 bg-cyber-900/90 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-gold-500/20 bg-cyber-950 p-4 sm:p-5 text-xs font-black uppercase tracking-wider">
            <div className="text-slate-400">Recurso / Rotina</div>
            <div className="text-red-400 mt-2 md:mt-0">❌ Caderno / Sistema Comum</div>
            <div className="text-gold-300 mt-2 md:mt-0">⭐ CDS Sistemas (Inovação)</div>
          </div>

          <div className="divide-y divide-white/5">
            {comparisonRows.map((row, idx) => (
              <div
                key={row.feature}
                className="grid grid-cols-1 md:grid-cols-[1.2fr_1.4fr_1.4fr] p-4 sm:p-5 text-xs sm:text-sm transition-colors hover:bg-gold-500/[0.03]"
              >
                <div className="font-extrabold text-white flex items-center gap-2">
                  <span className="text-gold-400 font-mono">#{idx + 1}</span>
                  <span>{row.feature}</span>
                </div>
                <div className="mt-2 md:mt-0 text-slate-400 flex items-start gap-2 bg-red-500/[0.04] p-2.5 rounded-xl border border-red-500/10 md:bg-transparent md:p-0 md:border-0">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{row.legacy}</span>
                </div>
                <div className="mt-2 md:mt-0 text-slate-200 font-medium flex items-start gap-2 bg-gold-500/[0.08] p-2.5 rounded-xl border border-gold-500/20 md:bg-transparent md:p-0 md:border-0">
                  <span className="text-gold-400 font-bold shrink-0">✓</span>
                  <span>{row.cds}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gold-500/20 bg-cyber-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm font-bold text-white text-center sm:text-left">
              Pronto para dar o salto de qualidade na sua gestão?
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="gold" size="sm" onClick={onOpenDemo}>
                ▶ Testar Simulador Agora
              </Button>
              <Button variant="glass" size="sm" href={getWhatsAppUrl()}>
                Migrar Meu Sistema
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
