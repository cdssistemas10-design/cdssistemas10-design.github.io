import { useRef, useState } from "react";
import { useSiteConfig, type PlanConfig } from "../context/SiteConfigContext";

type Tab = "contatos" | "whatsapp" | "redes" | "planos";
export default function AdminConfig({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, updateConfig, resetConfig } = useSiteConfig();
  const [tab, setTab] = useState<Tab>("contatos");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!open) return null;

  const set = (key: keyof typeof config, value: unknown) => updateConfig({ [key]: value } as Partial<typeof config>);
  const updatePlan = (index: number, patch: Partial<PlanConfig>) => {
    const plans = config.plans.map((p, i) => i === index ? { ...p, ...patch } : p);
    set("plans", plans);
  };
  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "cds-site-config.json"; a.click(); URL.revokeObjectURL(url);
  };
  const importConfig = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      updateConfig(parsed);
      setSaved(true);
    } catch { alert("Arquivo de configuração inválido."); }
  };
  const field = (label: string, key: keyof typeof config, placeholder = "") => <label className="block text-xs font-semibold text-slate-600">{label}<input value={String(config[key] ?? "")} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"/></label>;

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
      <header className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-200">CDS Sistemas · Administração do site</p><h2 className="text-lg font-bold">Configurações comerciais</h2></div><button onClick={onClose} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Fechar ✕</button></header>
      <div className="flex flex-wrap gap-1 border-b bg-white px-4 py-3">{([["contatos","Contatos"],["whatsapp","WhatsApp"],["redes","Redes sociais"],["planos","Planos de assinatura"]] as [Tab,string][]).map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab===id?"bg-blue-700 text-white":"text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {tab==="contatos"&&<div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><h3 className="font-bold text-slate-800">Canais oficiais da CDS</h3><p className="mt-1 text-xs text-slate-500">Esses dados alimentam o rodapé, botões de contato e solicitações de demonstração.</p></div>{field("WhatsApp com DDI e DDD (somente números)","whatsappNumber","5588999999999")}{field("Telefone exibido","phoneDisplay","(88) 00000-0000")}{field("E-mail comercial","email","contato@suaempresa.com.br")}{field("Endereço / cidade de atendimento","address","Juazeiro do Norte - CE")}</div>}
        {tab==="whatsapp"&&<div className="max-w-2xl space-y-4"><h3 className="font-bold text-slate-800">Atendimento pelo WhatsApp</h3>{field("Número do WhatsApp (DDI + DDD + número)","whatsappNumber","5588999999999")}<label className="block text-xs font-semibold text-slate-600">Mensagem padrão<textarea value={config.whatsappDefaultMessage} onChange={(e)=>set("whatsappDefaultMessage",e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"/></label><p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Os botões de contato e contratação dos planos usarão esse número e mensagem. Para mensagens específicas, o site acrescenta o contexto da página.</p></div>}
        {tab==="redes"&&<div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><h3 className="font-bold text-slate-800">Perfis oficiais</h3><p className="mt-1 text-xs text-slate-500">Informe o endereço completo de cada perfil. Deixe vazio se ainda não existir.</p></div>{field("Instagram","instagram","https://instagram.com/suaempresa")}{field("Facebook","facebook","https://facebook.com/suaempresa")}{field("YouTube","youtube","https://youtube.com/@suaempresa")}{field("LinkedIn","linkedin","https://linkedin.com/company/suaempresa")}</div>}
        {tab==="planos"&&<div className="space-y-4"><div><h3 className="font-bold text-slate-800">Planos de assinatura</h3><p className="mt-1 text-xs text-slate-500">Edite nomes, preços, benefícios e chamadas. Confira os valores antes de publicar.</p></div>{config.plans.map((plan,i)=><section key={`${plan.name}-${i}`} className="rounded-xl border border-slate-200 bg-white p-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Nome do plano<input value={plan.name} onChange={(e)=>updatePlan(i,{name:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Preço mensal (R$)<input type="number" min="0" step="0.01" value={plan.priceMonthly} onChange={(e)=>updatePlan(i,{priceMonthly:Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Preço anual equivalente / mês (R$)<input type="number" min="0" step="0.01" value={plan.priceAnnual} onChange={(e)=>updatePlan(i,{priceAnnual:Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Texto do botão<input value={plan.cta} onChange={(e)=>updatePlan(i,{cta:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Descrição<textarea rows={2} value={plan.tagline} onChange={(e)=>updatePlan(i,{tagline:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Benefícios (um por linha)<textarea rows={5} value={plan.features.join("\n")} onChange={(e)=>updatePlan(i,{features:e.target.value.split("\n").filter(Boolean)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={plan.highlight} onChange={(e)=>updatePlan(i,{highlight:e.target.checked})}/> Destacar como plano recomendado</label><button type="button" onClick={()=>set("plans",config.plans.filter((_,index)=>index!==i))} className="justify-self-start text-xs font-semibold text-red-700">Remover este plano</button></div></section>)}<button onClick={()=>set("plans",[...config.plans,{name:"Novo plano",priceMonthly:0,priceAnnual:0,tagline:"",badge:"",features:[],highlight:false,cta:"Falar com a CDS"}])} className="rounded-lg border border-blue-300 px-4 py-2 text-xs font-bold text-blue-700">+ Adicionar plano</button></div>}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><b>Importante sobre GitHub Pages:</b> esta hospedagem é estática. As alterações ficam salvas neste navegador (localStorage) e não mudam automaticamente o site para os visitantes. Use “Exportar configurações” e aplique o arquivo no projeto antes de publicar a atualização no GitHub. Para edição online compartilhada, será necessário conectar um backend/CMS.</div>
        {saved&&<p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">Configuração importada/salva neste navegador.</p>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-white px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={exportConfig} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Exportar configurações JSON</button><button onClick={()=>fileRef.current?.click()} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Importar JSON</button><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e)=>importConfig(e.target.files?.[0])}/><button onClick={()=>{if(confirm("Restaurar todas as configurações padrão?"))resetConfig();}} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700">Restaurar padrão</button></div><button onClick={()=>{setSaved(true);onClose();}} className="rounded-lg bg-blue-700 px-5 py-2.5 text-xs font-bold text-white">Salvar e fechar</button></footer>
    </div>
  </div>;
}
