import { useEffect, useState } from "react";
import { CdsLogo } from "./CdsLogo";
import { Button } from "./ui";
import { useSiteConfig } from "../context/SiteConfigContext";
import { Sound } from "../utils/sound";
import { cn } from "../utils/cn";

const NAV_LINKS = [
  { href: "#/", label: "Início" },
  { href: "#/solucoes", label: "Soluções" },
  { href: "#/segmentos", label: "Segmentos" },
  { href: "#/demonstracao", label: "Demonstração" },
  { href: "#/planos", label: "Planos" },
  { href: "#/quem-somos", label: "Quem somos" },
  { href: "#/contato", label: "Contato" },
];

export default function Header({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { getWhatsAppUrl } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleRoute = () => setActiveSection(window.location.hash || "#/");
    handleScroll();
    handleRoute();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleRoute);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleRoute);
    };
  }, []);

  const handleToggleSound = () => {
    const next = Sound.toggle();
    setSoundOn(next);
    if (next) Sound.beep();
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gold-500/15 bg-cyber-950/90 shadow-2xl shadow-black/80 backdrop-blur-xl py-3"
          : "bg-transparent py-4 sm:py-5"
      )}
    >
      <div className="container-x flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#/" className="group flex items-center transition-transform hover:scale-[1.02]">
          <CdsLogo size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 xl:gap-3 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => Sound.click()}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                activeSection === link.href
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons: Sound, Admin & WhatsApp CTA */}
        <div className="hidden items-center gap-2 sm:flex">
          {/* Audio FX Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? "Efeitos sonoros ativados (clique para mutar)" : "Efeitos sonoros mutados (clique para ativar)"}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition",
              soundOn
                ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                : "border-white/10 bg-white/5 text-slate-500"
            )}
          >
            <span>{soundOn ? "🔊" : "🔇"}</span>
          </button>

          {/* Main Header CTA matching reference: "Fale com a CDS ↗" */}
          <Button
            variant="dark"
            size="sm"
            href={getWhatsAppUrl()}
            className="border-white/20 hover:border-gold-400/60 font-bold px-4"
          >
            <span>Fale com a CDS</span>
            <span className="text-xs">↗</span>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            aria-label="Menu de Navegação"
            onClick={() => {
              Sound.click();
              setMobileMenu(!mobileMenu);
            }}
            className="grid h-10 w-10 place-items-center rounded-xl border border-gold-500/20 bg-cyber-900 text-white"
          >
            <div className="space-y-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-gold-400 transition-transform duration-300",
                  mobileMenu && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-gold-400 transition-opacity duration-300",
                  mobileMenu && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-gold-400 transition-transform duration-300",
                  mobileMenu && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "overflow-hidden border-b border-gold-500/20 bg-cyber-950/98 backdrop-blur-2xl transition-all duration-300 lg:hidden",
          mobileMenu ? "max-h-[520px] py-4" : "max-h-0 py-0 border-transparent"
        )}
      >
        <div className="container-x space-y-1.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                Sound.click();
                setMobileMenu(false);
              }}
              className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-gold-500/10 hover:text-gold-300"
            >
              <span>{link.label}</span>
              <span className="text-xs text-gold-400">→</span>
            </a>
          ))}

          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <Button
              variant="gold"
              onClick={() => {
                setMobileMenu(false);
                onOpenDemo();
              }}
              className="w-full text-xs"
            >
              ▶ Testar PDV
            </Button>
            <Button
              variant="dark"
              href={getWhatsAppUrl()}
              className="w-full text-xs"
            >
              Falar no WhatsApp
            </Button>
          </div>

          <div className="pt-2 flex items-center justify-end text-xs text-slate-400 border-t border-white/5 mt-2">
            <button
              onClick={handleToggleSound}
              className="inline-flex items-center gap-1 text-slate-400"
            >
              <span>{soundOn ? "🔊 Som Ativado" : "🔇 Som Mutado"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
