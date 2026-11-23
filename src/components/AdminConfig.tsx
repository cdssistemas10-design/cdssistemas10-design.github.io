import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  createDefaultSiteConfig,
  mergeSiteConfig,
  useSiteConfig,
  type PlanConfig,
  type SiteConfig,
} from "../context/SiteConfigContext";

type Tab = "contatos" | "whatsapp" | "redes" | "planos";

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      headers,
    });
  } catch {
    throw new Error("API administrativa indisponível. Verifique a conexão com o servidor.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = isRecord(body) && typeof body.error === "string"
      ? body.error
      : `A API administrativa respondeu com HTTP ${response.status}.`;
    throw new ApiRequestError(message, response.status);
  }
  if (!isRecord(body)) {
    throw new Error("A API administrativa retornou uma resposta inválida.");
  }
  return body;
}

function readAuthStatus(value: Record<string, unknown>) {
  if (typeof value.authenticated !== "boolean" || typeof value.mustChangePassword !== "boolean") {
    throw new Error("A API retornou um estado de sessão inválido.");
  }
  return {
    authenticated: value.authenticated,
    mustChangePassword: value.mustChangePassword,
  };
}

function readSettings(value: Record<string, unknown>, fallback: SiteConfig): SiteConfig {
  if (!Object.prototype.hasOwnProperty.call(value, "settings")) {
    throw new Error("A API não retornou as configurações administrativas.");
  }
  return value.settings === null ? fallback : mergeSiteConfig(fallback, value.settings);
}

function readCsrfToken(value: Record<string, unknown>): string {
  if (typeof value.csrfToken !== "string" || !value.csrfToken) {
    throw new Error("A API não retornou um token CSRF válido.");
  }
  return value.csrfToken;
}

export default function AdminConfig({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config: persistedConfig, updateConfig } = useSiteConfig();
  const [draftConfig, setDraftConfig] = useState<SiteConfig | null>(null);
  const [draftDirty, setDraftDirty] = useState(false);
  const draftDirtyRef = useRef(false);
  const [tab, setTab] = useState<Tab>("contatos");
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishState, setPublishState] = useState<
    "idle" | "ready" | "publishing" | "commit_received" | "workflow_waiting" |
    "workflow_running" | "deploy_completed" | "workflow_failed" | "conflict" | "failed" | "duplicate"
  >("idle");
  const [commitSha, setCommitSha] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const wasAuthenticated = useRef(false);
  const config = draftConfig ?? persistedConfig;

  useLayoutEffect(() => {
    if (!open) return;
    setAuthenticated(false);
    setMustChangePassword(false);
    setCheckingSession(true);
    setLoadingSettings(false);
  }, [open]);

  const markSessionExpired = () => {
    wasAuthenticated.current = false;
    setAuthenticated(false);
    setMustChangePassword(false);
    setError("Sua sessão expirou. Entre novamente para continuar; o rascunho foi preservado.");
  };

  const protectedRequest = async (path: string, options: RequestInit = {}) => {
    try {
      return await apiRequest(path, options);
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 401) {
        markSessionExpired();
        throw new ApiRequestError(
          "Sua sessão expirou. Entre novamente para continuar; o rascunho foi preservado.",
          401,
        );
      }
      throw cause;
    }
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    setAuthenticated(false);
    setMustChangePassword(false);
    setCheckingSession(true);
    setLoadingSettings(false);
    setSaved(false);
    setError("");

    const checkSession = async () => {
      try {
        const status = readAuthStatus(await apiRequest("/api/auth/status"));
        if (!active) return;
        if (!status.authenticated) {
          if (wasAuthenticated.current) {
            setError("Sua sessão expirou. Entre novamente para continuar.");
          }
          wasAuthenticated.current = false;
          return;
        }

        wasAuthenticated.current = true;
        setAuthenticated(true);
        setMustChangePassword(status.mustChangePassword);
        if (status.mustChangePassword) return;

        setLoadingSettings(true);
        const settings = readSettings(
          await protectedRequest("/api/admin/settings"),
          persistedConfig,
        );
        if (!active) return;
        if (!draftDirtyRef.current) {
          setDraftConfig(settings);
          setDraftDirty(false);
          setFeedback("");
        } else {
          setFeedback("Seu rascunho não salvo foi preservado. Revise-o antes de salvar.");
        }
      } catch (cause) {
        if (!active) return;
        wasAuthenticated.current = false;
        setAuthenticated(false);
        setMustChangePassword(false);
        setError(cause instanceof Error
          ? cause.message
          : "Não foi possível verificar a sessão com a API administrativa.");
      } finally {
        if (active) {
          setCheckingSession(false);
          setLoadingSettings(false);
        }
      }
    };

    void checkSession();
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setCheckingSession(true);
    try {
      const status = readAuthStatus(await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }));
      if (!status.authenticated) throw new Error("A API não confirmou a autenticação.");
      wasAuthenticated.current = true;
      setAuthenticated(true);
      setMustChangePassword(status.mustChangePassword);
      setPassword("");
      if (!status.mustChangePassword) {
        setLoadingSettings(true);
        const settings = readSettings(
          await protectedRequest("/api/admin/settings"),
          persistedConfig,
        );
        if (!draftDirtyRef.current) {
          setDraftConfig(settings);
          setDraftDirty(false);
          setFeedback("");
        } else {
          setFeedback("Seu rascunho não salvo foi preservado. Revise-o antes de salvar.");
        }
      }
    } catch (cause) {
      setAuthenticated(false);
      wasAuthenticated.current = false;
      setError(cause instanceof Error ? cause.message : "Falha no login.");
    } finally {
      setLoadingSettings(false);
      setCheckingSession(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    let passwordChanged = false;
    setCheckingSession(true);
    try {
      const csrf = readCsrfToken(await protectedRequest("/api/auth/csrf"));
      const result = await apiRequest("/api/auth/password", {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (result.changed !== true) throw new Error("A API não confirmou a alteração da senha.");
      passwordChanged = true;
      setMustChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setLoadingSettings(true);
      const settings = readSettings(
        await protectedRequest("/api/admin/settings"),
        persistedConfig,
      );
      if (!draftDirtyRef.current) {
        setDraftConfig(settings);
        setDraftDirty(false);
      }
      setSaved(false);
      setFeedback("Senha alterada. Configurações administrativas carregadas.");
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 401 && cause.message === "Senha atual inválida.") {
        setError(cause.message);
      } else if (cause instanceof ApiRequestError && cause.status === 401) {
        markSessionExpired();
      } else if (passwordChanged) {
        setAuthenticated(false);
        wasAuthenticated.current = false;
        setError("Senha alterada, mas não foi possível carregar as configurações. Entre novamente.");
      } else {
        setError(cause instanceof Error ? cause.message : "Falha ao alterar senha.");
      }
    } finally {
      setLoadingSettings(false);
      setCheckingSession(false);
    }
  };

  const logout = async () => {
    setCheckingSession(true);
    try {
      const csrf = readCsrfToken(await protectedRequest("/api/auth/csrf"));
      const result = await protectedRequest("/api/auth/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
      });
      if (result.authenticated !== false) throw new Error("A API não confirmou o encerramento da sessão.");
      setAuthenticated(false);
      setMustChangePassword(false);
      setUsername("");
      setPassword("");
      wasAuthenticated.current = false;
      setError("");
      setFeedback(draftDirtyRef.current
        ? "Sessão encerrada. O rascunho não salvo foi preservado neste painel."
        : "Sessão encerrada.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao sair.");
    } finally {
      setCheckingSession(false);
    }
  };

  const set = <K extends keyof SiteConfig,>(key: K, value: SiteConfig[K]) => {
    const next = { ...config, [key]: value };
    draftDirtyRef.current = true;
    setDraftDirty(true);
    setDraftConfig(next);
    setSaved(false);
    setFeedback("");
    setError("");
  };
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
      const parsed: unknown = JSON.parse(await file.text());
      const imported = mergeSiteConfig(config, parsed);
      draftDirtyRef.current = true;
      setDraftDirty(true);
      setDraftConfig(imported);
      setSaved(false);
      setFeedback("JSON importado neste painel. Clique em “Salvar no servidor” para publicar.");
      setError("");
    } catch (cause) {
      setFeedback(cause instanceof Error ? cause.message : "Arquivo de configuração inválido.");
    }
  };
  const resetDraftConfig = () => {
    draftDirtyRef.current = true;
    setDraftDirty(true);
    setDraftConfig(createDefaultSiteConfig());
    setSaved(false);
    setFeedback("Padrões carregados apenas neste rascunho. Salve no servidor para persistir.");
    setError("");
  };
  const closePanel = () => {
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    onClose();
  };
  const field = (label: string, key: keyof typeof config, placeholder = "") => <label className="block text-xs font-semibold text-slate-600">{label}<input value={String(config[key] ?? "")} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"/></label>;

  if (checkingSession || loadingSettings || saving) {
    return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div role="status" className="w-full max-w-sm rounded-2xl bg-slate-100 p-6 text-center text-sm font-semibold text-slate-700 shadow-2xl">
        {saving ? "Gravando configurações no servidor..." : "Verificando sessão e carregando configurações do servidor..."}
      </div>
    </div>;
  }

  if (!authenticated) {
    return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <form onSubmit={login} className="w-full max-w-sm rounded-2xl bg-slate-100 p-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">Acesso restrito</p>
        <h2 className="mt-2 text-xl font-black text-slate-900">Painel administrativo</h2>
        <label className="mt-5 block text-xs font-bold text-slate-700">Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900"/>
        </label>
        <label className="mt-3 block text-xs font-bold text-slate-700">Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900"/>
        </label>
        {feedback && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">{feedback}</p>}
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={closePanel} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700">Fechar</button>
          <button type="submit" className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white">Entrar</button>
        </div>
      </form>
    </div>;
  }

  if (mustChangePassword) {
    return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <form onSubmit={changePassword} className="w-full max-w-sm rounded-2xl bg-slate-100 p-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">Primeiro acesso</p>
        <h2 className="mt-2 text-xl font-black text-slate-900">Alterar senha inicial</h2>
        <label className="mt-5 block text-xs font-bold text-slate-700">Senha atual
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900"/>
        </label>
        <label className="mt-3 block text-xs font-bold text-slate-700">Nova senha
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900"/>
        </label>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <button type="submit" className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white">Salvar nova senha</button>
      </form>
    </div>;
  }

  const saveToServer = async () => {
    setError("");
    setFeedback("");
    setSaving(true);
    try {
      const csrf = readCsrfToken(await protectedRequest("/api/auth/csrf"));
      const result = await protectedRequest("/api/admin/settings", {
        method: "PUT",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify({ settings: config }),
      });
      if (result.updated !== true) throw new Error("A API não confirmou a gravação das configurações.");
      updateConfig(config);
      setDraftConfig(config);
      draftDirtyRef.current = false;
      setDraftDirty(false);
      setSaved(true);
      setFeedback("Configurações gravadas com sucesso no servidor.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const publishToGitHub = async () => {
    if (publishing) return;
    if (!window.confirm("Publicar estas configurações no GitHub Pages? A alteração será enviada ao repositório principal.")) return;

    setError("");
    setFeedback("");
    setPublishing(true);
    setPublishState("publishing");

    try {
      if (draftDirtyRef.current) {
        const csrf = readCsrfToken(await protectedRequest("/api/auth/csrf"));
        const savedResult = await protectedRequest("/api/admin/settings", {
          method: "PUT",
          headers: { "X-CSRF-Token": csrf },
          body: JSON.stringify({ settings: config }),
        });
        if (savedResult.updated !== true) throw new Error("A API não confirmou a gravação das configurações.");
        draftDirtyRef.current = false;
        setDraftDirty(false);
        setSaved(true);
        updateConfig(config);
      }

      const csrf = readCsrfToken(await protectedRequest("/api/auth/csrf"));
      const prepared = await protectedRequest("/api/admin/publish/prepare", {
        headers: { "X-CSRF-Token": csrf },
      });
      if (typeof prepared.baseSha !== "string") throw new Error("A preparação da publicação não retornou SHA válido.");

      const result = await protectedRequest("/api/admin/publish", {
        method: "POST",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify({
          baseSha: prepared.baseSha,
          settings: config,
        }),
      });
      if (typeof result.commitSha !== "string") throw new Error("O GitHub não confirmou o commit.");

      setCommitSha(result.commitSha);
      if (typeof result.publishedAt === "string") setPublishedAt(result.publishedAt);
      setPublishState(result.duplicate === true ? "duplicate" : "commit_received");
      setFeedback(result.duplicate === true
        ? "O conteúdo já coincide com o repositório. Nenhum push foi criado."
        : "Commit recebido pelo GitHub. Acompanhando o workflow.");

      if (result.duplicate !== true) {
        for (let attempt = 0; attempt < 30; attempt += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 10_000));
          const status = await protectedRequest(`/api/admin/publish/status/${result.commitSha}`);
          const state = typeof status.state === "string" ? status.state : "workflow_waiting";
          setPublishState(state === "commit_received"
            ? "commit_received"
            : state === "workflow_waiting"
              ? "workflow_waiting"
              : state === "workflow_running"
                ? "workflow_running"
                : state === "deploy_completed"
                  ? "deploy_completed"
                  : "workflow_failed");
          if (state === "deploy_completed") {
            setFeedback("Deploy concluído pelo GitHub Pages.");
            break;
          }
          if (state === "workflow_failed") {
            setFeedback("O workflow do GitHub falhou.");
            break;
          }
        }
      }
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 409) setPublishState("conflict");
      else setPublishState("failed");
      setError(cause instanceof Error ? cause.message : "Falha ao publicar no GitHub.");
    } finally {
      setPublishing(false);
    }
  };

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
      <header className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-200">CDS Sistemas · Administração do site</p><h2 className="text-lg font-bold">Configurações comerciais</h2></div><button onClick={closePanel} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Fechar ✕</button></header>
      <div className="flex flex-wrap gap-1 border-b bg-white px-4 py-3">{([["contatos","Contatos"],["whatsapp","WhatsApp"],["redes","Redes sociais"],["planos","Planos de assinatura"]] as [Tab,string][]).map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab===id?"bg-blue-700 text-white":"text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {tab==="contatos"&&<div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><h3 className="font-bold text-slate-800">Canais oficiais da CDS</h3><p className="mt-1 text-xs text-slate-500">Esses dados alimentam o rodapé, botões de contato e solicitações de demonstração.</p></div>{field("WhatsApp com DDI e DDD (somente números)","whatsappNumber","55XXXXXXXXXXX")}{field("Telefone exibido","phoneDisplay","(88) 00000-0000")}{field("E-mail comercial","email","contato@suaempresa.com.br")}{field("Endereço / cidade de atendimento","address","Juazeiro do Norte - CE")}</div>}
        {tab==="whatsapp"&&<div className="max-w-2xl space-y-4"><h3 className="font-bold text-slate-800">Atendimento pelo WhatsApp</h3>{field("Número do WhatsApp (DDI + DDD + número)","whatsappNumber","55XXXXXXXXXXX")}<label className="block text-xs font-semibold text-slate-600">Mensagem padrão<textarea value={config.whatsappDefaultMessage} onChange={(e)=>set("whatsappDefaultMessage",e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"/></label><p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">Os botões de contato e contratação dos planos usarão esse número e mensagem. Para mensagens específicas, o site acrescenta o contexto da página.</p></div>}
        {tab==="redes"&&<div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><h3 className="font-bold text-slate-800">Perfis oficiais</h3><p className="mt-1 text-xs text-slate-500">Informe o endereço completo de cada perfil. Deixe vazio se ainda não existir.</p></div>{field("Instagram","instagram","https://instagram.com/suaempresa")}{field("Facebook","facebook","https://facebook.com/suaempresa")}{field("YouTube","youtube","https://youtube.com/@suaempresa")}{field("LinkedIn","linkedin","https://linkedin.com/company/suaempresa")}</div>}
        {tab==="planos"&&<div className="space-y-4"><div><h3 className="font-bold text-slate-800">Planos de assinatura</h3><p className="mt-1 text-xs text-slate-500">Edite nomes, preços, benefícios e chamadas. Confira os valores antes de publicar.</p></div>{config.plans.map((plan,i)=><section key={`${plan.name}-${i}`} className="rounded-xl border border-slate-200 bg-white p-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Nome do plano<input value={plan.name} onChange={(e)=>updatePlan(i,{name:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Preço mensal (R$)<input type="number" min="0" step="0.01" value={plan.priceMonthly} onChange={(e)=>updatePlan(i,{priceMonthly:Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Preço anual equivalente / mês (R$)<input type="number" min="0" step="0.01" value={plan.priceAnnual} onChange={(e)=>updatePlan(i,{priceAnnual:Number(e.target.value)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600">Texto do botão<input value={plan.cta} onChange={(e)=>updatePlan(i,{cta:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Descrição<textarea rows={2} value={plan.tagline} onChange={(e)=>updatePlan(i,{tagline:e.target.value})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Benefícios (um por linha)<textarea rows={5} value={plan.features.join("\n")} onChange={(e)=>updatePlan(i,{features:e.target.value.split("\n").filter(Boolean)})} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal text-slate-900"/></label><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={plan.highlight} onChange={(e)=>updatePlan(i,{highlight:e.target.checked})}/> Destacar como plano recomendado</label><button type="button" onClick={()=>set("plans",config.plans.filter((_,index)=>index!==i))} className="justify-self-start text-xs font-semibold text-red-700">Remover este plano</button></div></section>)}<button onClick={()=>set("plans",[...config.plans,{name:"Novo plano",priceMonthly:0,priceAnnual:0,tagline:"",badge:"",features:[],highlight:false,cta:"Falar com a CDS"}])} className="rounded-lg border border-blue-300 px-4 py-2 text-xs font-bold text-blue-700">+ Adicionar plano</button></div>}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900"><b>Proteção ativa:</b> somente esta sessão autenticada pode alterar as configurações no servidor. O primeiro administrador deve usar uma senha própria após o provisionamento.</div>
        {draftDirty&&<p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">Há alterações somente neste rascunho. Elas ainda não foram gravadas no servidor.</p>}
        {saved&&<p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">Configurações gravadas no servidor.</p>}
        {feedback&&<p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800">{feedback}</p>}
        {error&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      </div>
      <div className="border-t border-slate-200 px-4 py-3">
        {publishState !== "idle" && <p role="status" className="mb-3 text-xs font-semibold text-slate-700">
          Estado da publicação: {publishState === "commit_received" ? "Commit recebido" : publishState === "workflow_waiting" ? "Workflow aguardando" : publishState === "workflow_running" ? "Build em andamento" : publishState === "deploy_completed" ? "Publicado pelo GitHub Pages" : publishState === "workflow_failed" ? "Workflow com falha" : publishState === "conflict" ? "Conflito de versão" : publishState === "publishing" ? "Enviando ao GitHub" : publishState === "failed" ? "Publicação com falha" : publishState === "duplicate" ? "Conteúdo já coincide; nenhum push criado" : publishState}
          {commitSha && <span className="ml-2 font-mono text-[10px] text-slate-500">{commitSha.slice(0, 12)}</span>}
          {publishedAt && <span className="ml-2 text-[10px] text-slate-500">{new Date(publishedAt).toLocaleString("pt-BR")}</span>}
        </p>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-white px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={exportConfig} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Exportar configurações JSON</button><button onClick={()=>fileRef.current?.click()} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Importar JSON</button><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e)=>importConfig(e.target.files?.[0])}/><button onClick={()=>{if(confirm("Restaurar configurações padrão neste painel? O servidor só será alterado ao clicar em Salvar no servidor.")){resetDraftConfig();}}} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700">Restaurar padrão</button><button onClick={logout} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600">Sair</button></div><div className="flex gap-2"><button onClick={saveToServer} disabled={saving || publishing} className="rounded-lg bg-slate-700 px-5 py-2.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">{saving?"Salvando...":"Salvar alterações"}</button><button onClick={publishToGitHub} disabled={saving || publishing} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">{publishing?"Publicando...":"Publicar no site"}</button></div></footer>
    </div>
  </div>;
}
