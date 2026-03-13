import { useRef } from "react";
import { ExportPDF } from "@/components/ExportPDF";

export type StepType = "info" | "formula" | "substitution" | "calculation" | "result" | "verdict";

export interface Step {
  label: string;
  formula?: string;
  substitution?: string;
  result: string;
  type?: StepType;
}

interface StepByStepProps {
  steps: Step[];
}

const stepTypeConfig: Record<StepType, { icon: string; accent: string; bg: string }> = {
  info:         { icon: "📘", accent: "border-l-muted-foreground", bg: "bg-muted/30" },
  formula:      { icon: "📐", accent: "border-l-primary",         bg: "bg-primary/5" },
  substitution: { icon: "🔢", accent: "border-l-accent-foreground", bg: "bg-accent/10" },
  calculation:  { icon: "⚙️", accent: "border-l-primary",         bg: "bg-primary/5" },
  result:       { icon: "✅", accent: "border-l-primary",         bg: "bg-primary/10" },
  verdict:      { icon: "📋", accent: "border-l-primary",         bg: "bg-primary/10" },
};

export function StepByStep({ steps }: StepByStepProps) {
  const lastIndex = steps.length - 1;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={contentRef} className="rounded-lg border border-border bg-muted/40 p-6 border-l-4 border-l-primary">
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-foreground mb-5 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground text-xs font-bold">
            Σ
          </span>
          Memorial de Cálculo
        </h3>

        {/* Step counter */}
        <p className="text-xs font-body text-muted-foreground mb-4">
          {steps.length} etapas de resolução
        </p>

        <div className="flex flex-col space-y-4">
          {steps.map((step, i) => {
            const isLast = i === lastIndex;
            const type = step.type || (isLast ? "result" : i === 0 ? "formula" : "calculation");
            const config = stepTypeConfig[type];

            return (
              <div
                key={i}
                className={`
                  relative p-4 rounded-md border-l-4 ${config.accent} ${config.bg}
                  opacity-0 animate-step-in
                  ${isLast ? 'ring-2 ring-primary/20' : ''}
                `}
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                {/* Step number badge */}
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-heading font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <span>{config.icon}</span>
                      {step.label}
                    </p>

                    {/* Formula - the general equation */}
                    {step.formula && (
                      <div className="mb-2 px-3 py-1.5 rounded bg-background/80 border border-border/50 inline-block">
                        <p className="text-sm font-heading text-foreground italic tracking-wide">
                          {step.formula}
                        </p>
                      </div>
                    )}

                    {/* Substitution - values plugged in */}
                    {step.substitution && (
                      <div className="mb-2 px-3 py-1.5 rounded bg-accent/20 border border-accent/30 inline-block">
                        <p className="text-sm font-body text-foreground font-medium tracking-wide">
                          ➜ {step.substitution}
                        </p>
                      </div>
                    )}

                    {/* Result */}
                    <p className={`font-body text-foreground ${
                      isLast
                        ? 'text-lg font-extrabold text-primary mt-1'
                        : type === "result" || type === "verdict"
                          ? 'text-base font-bold text-primary'
                          : 'text-sm font-medium'
                    }`}>
                      {step.result}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        <ExportPDF contentRef={contentRef} />
      </div>
    </div>
  );
}
