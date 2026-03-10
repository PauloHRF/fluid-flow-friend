import { NavLink, useLocation } from "react-router-dom";

const calculators = [
  { title: "Calculadora de Reynolds", path: "/" },
  { title: "Equação de Bernoulli", path: "/bernoulli" },
  { title: "Perda de Carga (Darcy-Weisbach)", path: "/darcy-weisbach" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 min-w-[240px] bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border min-h-screen shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-sm font-bold tracking-widest uppercase font-heading">
          Atelier<br />Mecânica
        </h1>
      </div>
      <nav className="flex flex-col py-4">
        {calculators.map((calc) => (
          <NavLink
            key={calc.path}
            to={calc.path}
            end
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
    </aside>
  );
}
