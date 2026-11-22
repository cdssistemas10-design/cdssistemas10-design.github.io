export type Product = {
  id: number;
  code: string;
  name: string;
  price: number;
  unit: "UN" | "KG";
  stock: number;
  minStock: number;
  category: string;
  barcode: string;
  cost: number;
};

export const PRODUCTS: Product[] = [
  { id: 1, code: "7891000", barcode: "789100012345", name: "Arroz Branco Tipo 1 5kg", price: 24.9, cost: 18.5, unit: "UN", stock: 48, minStock: 15, category: "Mercearia" },
  { id: 2, code: "7891001", barcode: "789100123456", name: "Feijão Carioca 1kg", price: 8.49, cost: 5.8, unit: "UN", stock: 6, minStock: 12, category: "Mercearia" },
  { id: 3, code: "7891002", barcode: "789100234567", name: "Açúcar Cristal Especial 1kg", price: 4.79, cost: 3.1, unit: "UN", stock: 120, minStock: 30, category: "Mercearia" },
  { id: 4, code: "7891003", barcode: "789100345678", name: "Café Torrado e Moído 500g", price: 17.9, cost: 12.9, unit: "UN", stock: 18, minStock: 10, category: "Mercearia" },
  { id: 5, code: "7891004", barcode: "789100456789", name: "Óleo de Soja Refinado 900ml", price: 6.89, cost: 4.9, unit: "UN", stock: 54, minStock: 20, category: "Mercearia" },
  { id: 6, code: "7891005", barcode: "789100567890", name: "Refrigerante Guaraná 2L", price: 9.99, cost: 6.5, unit: "UN", stock: 64, minStock: 15, category: "Bebidas" },
  { id: 7, code: "7891006", barcode: "789100678901", name: "Água Mineral s/ Gás 500ml", price: 2.5, cost: 0.9, unit: "UN", stock: 210, minStock: 48, category: "Bebidas" },
  { id: 8, code: "7891007", barcode: "789100789012", name: "Cerveja Pilsen Lata 350ml", price: 3.99, cost: 2.7, unit: "UN", stock: 180, minStock: 36, category: "Bebidas" },
  { id: 9, code: "7891008", barcode: "200000000001", name: "Banana Prata Selecionada", price: 6.9, cost: 3.8, unit: "KG", stock: 32, minStock: 10, category: "Hortifruti" },
  { id: 10, code: "7891009", barcode: "200000000002", name: "Tomate Italiano Fresco", price: 8.3, cost: 4.9, unit: "KG", stock: 4.2, minStock: 10, category: "Hortifruti" },
  { id: 11, code: "7891010", barcode: "200000000003", name: "Batata Inglesa Lisa", price: 5.9, cost: 3.2, unit: "KG", stock: 18.5, minStock: 15, category: "Hortifruti" },
  { id: 12, code: "7891011", barcode: "200000000004", name: "Queijo Mussarela Fatiado", price: 42.0, cost: 29.0, unit: "KG", stock: 11.4, minStock: 8, category: "Frios" },
  { id: 13, code: "7891012", barcode: "200000000005", name: "Presunto Cozido Especial", price: 32.5, cost: 21.0, unit: "KG", stock: 8.7, minStock: 6, category: "Frios" },
  { id: 14, code: "7891013", barcode: "789101312345", name: "Detergente Líquido Neutro 500ml", price: 2.99, cost: 1.6, unit: "UN", stock: 85, minStock: 24, category: "Limpeza" },
  { id: 15, code: "7891014", barcode: "789101423456", name: "Sabão em Pó Concentrado 1kg", price: 14.9, cost: 9.8, unit: "UN", stock: 3, minStock: 12, category: "Limpeza" },
  { id: 16, code: "7891015", barcode: "789101534567", name: "Água Sanitária Tradicional 1L", price: 3.89, cost: 2.1, unit: "UN", stock: 45, minStock: 15, category: "Limpeza" },
];

export const PILLARS = [
  {
    icon: "📈",
    title: "Gestão Inteligente",
    desc: "Visão 360° do seu comércio com métricas de faturamento, margem real, ticket médio e DRE sem complicação.",
    badge: "Controle Total",
  },
  {
    icon: "⚙️",
    title: "Automação",
    desc: "Venda rápida com leitor, integração com balança, impressão térmica, gaveta de dinheiro e cálculo automático de troco.",
    badge: "Agilidade",
  },
  {
    icon: "🛡️",
    title: "Segurança",
    desc: "Fechamento cego de caixa, permissões por operador, auditoria de sangrias e contingência SEFAZ offline.",
    badge: "Anti-Fraude",
  },
  {
    icon: "☁️",
    title: "Conectividade",
    desc: "Backup em nuvem automático, sincronização multi-dispositivos e painel gerencial no seu celular.",
    badge: "Cloud Sync",
  },
  {
    icon: "💻",
    title: "Tecnologia",
    desc: "Arquitetura ultrarrápida que não trava nos horários de pico e funciona mesmo quando a internet cai.",
    badge: "Alta Performance",
  },
  {
    icon: "🧠",
    title: "Inteligência",
    desc: "Curva ABC de produtos, alertas automáticos de estoque crítico e sugestão inteligente de compras.",
    badge: "Insights",
  },
  {
    icon: "👥",
    title: "Pessoas",
    desc: "Treinamento descomplicado para operadores de caixa e suporte humanizado direto pelo WhatsApp no Cariri.",
    badge: "Suporte Local",
  },
  {
    icon: "🎯",
    title: "Resultados",
    desc: "Mais organização no caixa, no estoque, no financeiro e no relacionamento com clientes.",
    badge: "Lucratividade",
  },
];

export const MODULES = [
  {
    id: "pdv",
    tab: "Frente de Caixa (PDV)",
    icon: "🛒",
    headline: "Frente de caixa organizada para agilizar o atendimento",
    desc: "Frente de caixa intuitiva com atalhos F2 a F12, leitura de código de barras, peso direto da balança, teclado numérico e múltiplas formas de pagamento em uma única venda.",
    features: [
      "Rotinas de venda e caixa organizadas para o operador",
      "Atalhos de teclado ágeis para quem está no balcão",
      "Integração com balanças Toledo, Filizola, Elgin e Prix",
      "Venda mista (ex: R$ 50 no Pix + R$ 30 no Dinheiro)",
      "Fechamento de caixa cego para evitar quebras",
      "Devolução, cancelamento com senha de gerente e sangrias",
    ],
    metric: "Atendimento ágil no caixa",
  },
  {
    id: "nfce",
    tab: "Emissão Fiscal NFC-e / NF-e",
    icon: "🧾",
    headline: "Rotinas fiscais integradas à operação",
    desc: "O CDS possui rotinas para NFC-e e NF-e, com configuração fiscal conforme a empresa, certificado digital e regras da SEFAZ.",
    features: [
      "Contingência offline automática se a SEFAZ oscilar",
      "Envio do cupom em PDF e XML direto no WhatsApp do cliente",
      "Cálculo automático de ICMS, PIS, COFINS, NCM e CEST",
      "Geração do arquivo fiscal mensal para o seu contador em 1 clique",
      "Reimpressão fácil de cupons anteriores",
      "Configuração fiscal conforme credenciamento e regras aplicáveis",
    ],
    metric: "Rotinas fiscais integradas",
  },
  {
    id: "estoque",
    tab: "Controle de Estoque & Curva ABC",
    icon: "📦",
    headline: "Saiba exatamente o que comprar e o que está parado",
    desc: "Chega de perder dinheiro com produtos vencidos ou falta de mercadoria no fim de semana. Controle entradas por importação de XML de fornecedores, saídas, perdas e inventário.",
    features: [
      "Importação automática de XML de compras (cadastra produtos em lote)",
      "Alertas visuais de estoque baixo e estoque crítico",
      "Classificação Curva ABC (produtos que mais geram receita)",
      "Controle de lote e validade de perecíveis",
      "Ajuste rápido de inventário por conferência com leitor",
      "Impressão de etiquetas de gôndola e código de barras",
    ],
    metric: "Acompanhamento de estoque",
  },
  {
    id: "financeiro",
    tab: "Financeiro & Fluxo de Caixa",
    icon: "💰",
    headline: "Clareza total sobre o dinheiro que entra e sai",
    desc: "Acompanhe o caixa em tempo real, contas a pagar a fornecedores, contas a receber, DRE simplificado e conciliação por forma de pagamento (Pix, Cartão, Dinheiro).",
    features: [
      "Relatório detalhado de sangrias e suprimentos",
      "Conferência exata de taxas de maquininhas de cartão",
      "Contas a pagar com alertas de vencimento",
      "DRE Gerencial simplificado (Faturamento - Custo = Lucro Real)",
      "Histórico de movimentações por operador e turno",
      "Gráficos de evolução financeira diária, semanal e mensal",
    ],
    metric: "Zero furo no caixa diário",
  },
  {
    id: "crediario",
    tab: "Clientes, Fiado & Cobrança",
    icon: "👥",
    headline: "Fiado profissional sem perder amizade nem dinheiro",
    desc: "Substitua o caderno de notas por uma conta de crediário digital com limite de crédito, histórico de compras, comprovante assinado e cobrança educada pelo WhatsApp.",
    features: [
      "Limite de crédito pré-definido por cliente",
      "Comprovante de débito impresso na hora com assinatura",
      "Aviso de contas a vencer e vencidas",
      "Botão de cobrança direta via WhatsApp com chave Pix",
      "Histórico completo de compras e preferências do cliente",
      "Bloqueio automático de inadimplentes no PDV",
    ],
    metric: "Controle de crediário",
  },
  {
    id: "mobile",
    tab: "Gestão e Indicadores",
    icon: "📱",
    headline: "Acompanhe os indicadores e a operação do negócio",
    desc: "Tenha uma visão organizada dos indicadores de vendas, produtos, estoque e operação por meio dos painéis disponíveis no sistema.",
    features: [
      "Painel ao vivo com atualização instantânea",
      "Alertas de sangrias e cancelamentos no caixa",
      "Consulta de preço e estoque direto pelo celular",
      "Acesso seguro criptografado de ponta a ponta",
      "Multi-loja: visualize todas as suas filiais no mesmo app",
      "Painéis de acompanhamento no sistema",
    ],
    metric: "Visão 24h em tempo real",
  },
];

export const SEGMENTS = [
  { icon: "🏪", name: "Mercantis & Supermercados", desc: "Leitura rápida, balança no caixa, controle de lote e etiquetas de gôndola." },
  { icon: "🧺", name: "Mercadinhos de Bairro", desc: "Simples de usar, controle de fiado, caixa ágil e emissão de NFC-e." },
  { icon: "🛍️", name: "Lojas & Varejo", desc: "Cadastro de produtos, estoque, clientes, vendas e crediário." },
  { icon: "🧱", name: "Depósitos de Construção", desc: "Cadastro de materiais, unidades de medida, estoque, compras, vendas e financeiro." },
  { icon: "🥩", name: "Açougues & Casas de Carnes", desc: "Pesagem integrada, corte, desossa e cálculo ágil por quilo." },
  { icon: "🥖", name: "Padarias & Confeitarias", desc: "Comandas, pesagem rápida de balança, buffet e frente de caixa veloz." },
  { icon: "🍺", name: "Distribuidoras de Bebidas", desc: "Preço atacado/varejo por quantidade, controle de vasilhames e entregas." },
  { icon: "🔧", name: "Oficinas & Autopeças", desc: "Cadastro e controle de peças, estoque, compras, vendas e relacionamento com clientes." },
];

export const CITIES = [
  { name: "Juazeiro do Norte", state: "CE", status: "Atendimento Presencial & Suporte Rápido" },
  { name: "Crato", state: "CE", status: "Atendimento Presencial & Suporte Rápido" },
  { name: "Barbalha", state: "CE", status: "Atendimento Presencial & Suporte Rápido" },
  { name: "Caririaçu", state: "CE", status: "Implantação Presencial & Suporte" },
  { name: "Missão Velha", state: "CE", status: "Implantação Presencial & Suporte" },
  { name: "Lavras da Mangabeira", state: "CE", status: "Implantação Presencial & Suporte" },
  { name: "Brejo Santo", state: "CE", status: "Atendimento Regional Cariri" },
  { name: "Mauriti", state: "CE", status: "Atendimento Regional Cariri" },
  { name: "Farias Brito", state: "CE", status: "Atendimento Regional Cariri" },
  { name: "Iguatu", state: "CE", status: "Atendimento Centro-Sul & Cariri" },
];

export const PLANS = [
  {
    name: "CDS Gestão",
    priceMonthly: 150,
    priceAnnual: 150,
    tagline: "Gestão comercial integrada para organizar a operação do seu negócio.",
    badge: "Plano principal",
    features: [
      "Frente de caixa e vendas",
      "Cadastro de produtos e controle de estoque",
      "Compras e Central de Entradas",
      "Financeiro: contas a pagar e receber",
      "Cadastro de clientes e crediário",
      "Rotinas fiscais conforme configuração da empresa",
    ],
    highlight: true,
    cta: "Consultar implantação",
  },
];

export const TESTIMONIALS = [];

export const FAQS = [
  {
    q: "Quais áreas do comércio o CDS Sistemas ajuda a controlar?",
    a: "O CDS reúne rotinas de frente de caixa, produtos e estoque, compras e entradas, clientes, financeiro e documentos fiscais. A configuração é ajustada conforme o tipo e a operação de cada empresa.",
  },
  {
    q: "O sistema emite NFC-e e NF-e?",
    a: "O CDS possui módulos e rotinas para documentos fiscais eletrônicos, incluindo NFC-e e NF-e. A emissão depende da configuração fiscal da empresa, certificado digital, credenciamento e regras aplicáveis.",
  },
  {
    q: "Consigo acompanhar compras e notas de fornecedores?",
    a: "A Central Inteligente de Entradas organiza o fluxo de documentos de fornecedores para consulta, revisão e processamento das entradas. O modo de operação pode ser assistido ou automático conforme a configuração.",
  },
  {
    q: "O CDS controla estoque e cadastro de produtos?",
    a: "Sim. O sistema possui cadastro e listagem de produtos, movimentações de estoque, compras, relatórios e ferramentas de apoio para conferência e reposição.",
  },
  {
    q: "Posso controlar contas a pagar, receber e crediário?",
    a: "O módulo Financeiro reúne contas a pagar, contas a receber, dívidas por cliente, condições de pagamento, histórico e relatórios. As rotinas são apresentadas conforme o perfil de acesso.",
  },
  {
    q: "Como funciona a implantação?",
    a: "A implantação começa pelo levantamento da operação, configuração do sistema, preparação dos cadastros e treinamento da equipe. Entre em contato para avaliarmos o cenário do seu comércio.",
  },
];

export const SHORTCUTS = [
  { key: "F2", action: "Buscar Produto por Nome ou Código" },
  { key: "F4", action: "Finalizar Venda / Tela de Pagamento" },
  { key: "F6", action: "Cancelar Venda Atual" },
  { key: "F8", action: "Sangria / Suprimento de Caixa" },
  { key: "F10", action: "Consultar Preço Rápido" },
  { key: "ESC", action: "Voltar / Fechar Janela" },
];
