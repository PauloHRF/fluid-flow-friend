import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/ThemeProvider";

const calculators = [
  { title: "Início", path: "/" },
  { title: "Calculadora de Reynolds", path: "/reynolds" },
  { title: "Equação de Bernoulli", path: "/bernoulli" },
  { title: "Perda de Carga (Darcy-Weisbach)", path: "/darcy-weisbach" },
  { title: "Equação da Continuidade", path: "/continuidade" },
  { title: "Manometria (Stevin)", path: "/manometria" },
  { title: "Empuxo (Arquimedes)", path: "/empuxo" },
  { title: "NPSH e Cavitação", path: "/npsh" },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const nav = (
    <nav className="flex flex-col py-4 flex-1">
      {calculators.map((calc) => (
        <NavLink
          key={calc.path}
          to={calc.path}
          end
          onClick={() => isMobile && setOpen(false)}
          className={() => {
            const isActive = location.pathname === calc.path;
            return `block px-6 py-3 text-sm font-heading transition-none ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground"
            }`;
          }}
        >
          {calc.title}
        </NavLink>
      ))}
    </nav>
  );

  const themeToggle = (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-6 py-3 text-sm font-heading text-sidebar-foreground cursor-pointer border-t border-sidebar-border"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
    </button>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 bg-sidebar text-sidebar-foreground p-2 cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-50 bg-foreground/50"
              onClick={() => setOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border animate-in slide-in-from-left duration-200">
              <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
                <h1 className="text-sm font-bold tracking-widest uppercase font-heading">
                  Atelier<br />Mecânica
                </h1>
                <button onClick={() => setOpen(false)} className="text-sidebar-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav}
              {themeToggle}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside className="w-60 min-w-[240px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border min-h-screen shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-sm font-bold tracking-widest uppercase font-heading">
          Atelier<br />Mecânica
        </h1>
      </div>
      {nav}
      {themeToggle}
    </aside>
  );
}
