import { useState } from "react";
import { Reveal, SectionHeader, Button, buildWhatsAppLink } from "./ui";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

export function HardwareSection() {
  const hardwareCategories = [
    {
      id: "balancas",
      icon: "⚖️",
      name: "Balanças de Checkout & Gôndola",
      brands: ["Toledo Prix 3 / 4 / 5", "Filizola Platina", "Urano Pop-Z", "Elgin DP-30", "Ramuza"],
      desc: "Pesagem instantânea no PDV conectada via cabo serial/USB ou leitura automática de etiquetas com código de barras gerado pela balança da padaria/açougue.",
    },
    {
      id: "impressoras",
      icon: "🖨️",
      name: "Impressoras Térmicas Não-Fiscais",
      brands: ["Epson TM-T20X", "Elgin i9 / i7 / i8", "Bematech MP-4200 TH", "Daruma DR800", "Control iD"],
      desc: "Impressão de Cupom Fiscal NFC-e (DANFE em bobina 80mm ou 58mm), comprovante de fiado com assinatura e relatórios de fechamento de caixa.",
    },
    {
      id: "leitores",
      icon: "🔍",
      name: "Leitores de Código de Barras",
      brands: ["Honeywell Voyager", "Elgin Flash / Quick", "Datalogic QW2100", "Nonus", "Bematech BR-400"],
      desc: "Leitura 1D e 2D (QR Code), leitores manuais com fio ou sem fio (wireless), e leitores fixos de mesa para supermercados com alto volume.",
    },
    {
      id: "gavetas",
      icon: "💵",
      name: "Gavetas de Dinheiro Automáticas",
      brands: ["Menno", "Bematech GD-56", "Elgin EG-50", "Gerbô", "Sweda"],
      desc: "Abertura automática sincronizada no momento da finalização da venda em dinheiro ou ao efetuar sangria com senha de operador.",
    },
    {
      id: "tef",
      icon: "💳",
      name: "TEF & Maquininhas Integradas",
      brands: ["Sitef / Software Express", "Stone TEF", "Cielo LIO", "Rede", "PagBank"],
      desc: "Conciliação bancária automática com envio do valor direto para a maquininha, evitando erro de digitação do operador.",
    },
    {
      id: "certificados",
      icon: "🛡️",
      name: "Certificados Digitais Homologados",
      brands: ["Certificado Digital A1 (Arquivo .pfx)", "Certisign", "Serasa Experian", "Soluti", "Valid"],
      desc: "Emissão fiscal sem necessidade de pendrive token A3, com renovação simples e backup automático na nuvem.",
    },
  ];

  const [activeTab, setActiveTab] = useState(hardwareCategories[0].id);

  const selected = hardwareCategories.find((h) => h.id === activeTab) || hardwareCategories[0];

  const handleSelect = (id: string) => {
    Sound.click();
    setActiveTab(id);
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            badge="Compatibilidade Total"
            title={
              <>
                Funciona perfeitamente com os{" "}
                <span className="text-gold-gradient">equipamentos que você já tem</span>
              </>
            }
            subtitle="Não precisa trocar seus computadores, impressoras ou balanças. A CDS Sistemas integra diretamente com as marcas líderes de automação comercial."
          />
        </Reveal>

        {/* Categories Tabs */}
        <div className="mt-12 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar lg:justify-center">
          {hardwareCategories.map((h) => (
            <button
              key={h.id}
              onClick={() => handleSelect(h.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all",
                activeTab === h.id
                  ? "border-gold-400 bg-gold-500/15 text-gold-300 shadow-md"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
              )}
            >
              <span>{h.icon}</span>
              <span>{h.name}</span>
            </button>
          ))}
        </div>

        {/* Selected Hardware Details Card */}
        <div className="mt-8">
          <Reveal key={selected.id}>
            <div className="glass-card rounded-3xl border border-gold-500/30 p-6 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500/20 text-2xl border border-gold-500/30">
                      {selected.icon}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-gold-300 uppercase tracking-wider">
                        Hardware 100% Homologado
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white">{selected.name}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">
                    {selected.desc}
                  </p>

                  <div className="mt-6">
                    <Button
                      variant="gold"
                      size="sm"
                      href={buildWhatsAppLink(`Olá! Gostaria de confirmar se meu equipamento (${selected.name}) é compatível com o sistema da CDS Sistemas.`)}
                    >
                      Consultar Meu Equipamento
                    </Button>
                  </div>
                </div>

                {/* Brands Supported Pills */}
                <div className="rounded-2xl border border-white/10 bg-cyber-900/90 p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Principais Marcas & Modelos Suportados
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.brands.map((b) => (
                      <span
                        key={b}
                        className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-3.5 py-2 text-xs font-bold text-gold-200"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] text-slate-400">
                    *Tem outro modelo? Realizamos o teste de homologação sem custo durante a instalação.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
