import { Reveal } from "./ui";

const VALUES = [
  {
    number: "01",
    title: "Inovação constante",
    description: "Buscar novas tecnologias, desenvolver soluções próprias e nunca deixar de evoluir.",
    icon: "✦",
  },
  {
    number: "02",
    title: "Compromisso e responsabilidade",
    description: "Entregar soluções confiáveis, respeitando compromissos e a confiança dos clientes.",
    icon: "◇",
  },
  {
    number: "03",
    title: "Respeito ao cliente",
    description: "Entender a realidade de cada empresa e atender às suas necessidades.",
    icon: "◎",
  },
  {
    number: "04",
    title: "Qualidade e excelência",
    description: "Priorizar arquitetura sólida, segurança, desempenho e qualidade.",
    icon: "⬡",
  },
  {
    number: "05",
    title: "Crescimento sustentável",
    description: "Crescer com planejamento, responsabilidade, resultados e relacionamentos duradouros.",
    icon: "↗",
  },
  {
    number: "06",
    title: "Inteligência e simplicidade",
    description: "Tornar processos complexos práticos, integrados e fáceis.",
    icon: "⌘",
  },
  {
    number: "07",
    title: "Valorização das pessoas",
    description: "Desenvolver tecnologia para ajudar pessoas, equipes e empresas a obter melhores resultados.",
    icon: "♡",
  },
];

export default function WhoWeAreSection() {
  return (
    <section id="quem-somos" className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(234,179,8,0.10),transparent_55%)]" />
      <div className="container-x relative">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-gold-300">
              Quem somos
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Tecnologia com propósito.{" "}
              <span className="text-gold-gradient">Gestão que transforma.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A CDS Sistemas desenvolve soluções tecnológicas para simplificar a gestão,
              conectar processos e fortalecer empresas de diferentes segmentos.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="glass-gold rounded-3xl p-7 sm:p-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-400/30 bg-gold-500/10 text-2xl text-gold-300">◎</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-300">Nossa missão</p>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-white sm:text-xl">
                Desenvolver soluções tecnológicas inteligentes que simplifiquem a gestão,
                conectem processos e fortaleçam empresas, proporcionando mais controle,
                eficiência, segurança e capacidade de crescimento.
              </p>
            </article>
            <article className="glass-card rounded-3xl p-7 sm:p-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-silver-400/25 bg-white/5 text-2xl text-silver-200">↗</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-silver-300">Nossa visão</p>
              <p className="mt-4 text-lg font-semibold leading-relaxed text-white sm:text-xl">
                Ser reconhecida como uma empresa de tecnologia de referência no Brasil,
                desenvolvendo plataformas inteligentes de gestão e soluções inovadoras
                que transformem negócios e contribuam para o crescimento sustentável
                de empresas de diferentes segmentos.
              </p>
            </article>
          </div>
        </Reveal>

        <div className="mt-16">
          <Reveal>
            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-300">Nossos princípios</p>
              <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">Os valores que orientam nossas decisões</h3>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
              <Reveal key={value.number}>
                <article className="group h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/35 hover:bg-gold-500/[0.045]">
                  <div className="flex items-start justify-between">
                    <span className="text-2xl text-gold-400">{value.icon}</span>
                    <span className="font-mono text-xs text-slate-600">{value.number}</span>
                  </div>
                  <h4 className="mt-5 text-lg font-extrabold text-white">{value.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{value.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-14 rounded-3xl border border-gold-500/25 bg-gradient-to-r from-gold-500/[0.10] via-white/[0.025] to-transparent px-6 py-8 text-center sm:px-12 sm:py-10">
            <p className="mx-auto max-w-4xl text-xl font-bold leading-relaxed text-white sm:text-2xl">
              “Não vendemos apenas sistemas. Desenvolvemos tecnologia para que empresas
              tenham controle do presente e capacidade de construir o futuro.”
            </p>
            <p className="mt-5 text-sm font-black tracking-wide text-gold-300">
              CDS Sistemas — Inteligência para gerir. Tecnologia para transformar.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
