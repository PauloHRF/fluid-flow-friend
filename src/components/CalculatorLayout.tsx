import { ReactNode, useEffect } from "react";

interface CalculatorLayoutProps {
  title: string;
  children: ReactNode;
  metaDescription?: string;
}

export function CalculatorLayout({ title, children, metaDescription }: CalculatorLayoutProps) {
  useEffect(() => {
    document.title = `${title} | Atelier Mecânica dos Fluidos`;
    if (metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", metaDescription);
    }
  }, [title, metaDescription]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-foreground tracking-tight">
        {title}
      </h1>
      {children}
    </div>
  );
}
