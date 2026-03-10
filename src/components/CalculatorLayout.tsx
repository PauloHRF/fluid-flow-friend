import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  children: ReactNode;
}

export function CalculatorLayout({ title, children }: CalculatorLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
      <h2 className="text-2xl font-heading font-bold mb-8 text-foreground tracking-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}
