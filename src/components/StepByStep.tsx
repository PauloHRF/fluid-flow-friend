import { useRef } from "react";
import { ExportPDF } from "@/components/ExportPDF";

interface Step {
  label: string;
  formula?: string;
  result: string;
}

interface StepByStepProps {
  steps: Step[];
}

export function StepByStep({ steps }: StepByStepProps) {
  const lastIndex = steps.length - 1;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={contentRef} className="rounded-lg border border-border bg-muted/40 p-6 border-l-4 border-l-primary">
        <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-foreground mb-4">
          Memorial de Cálculo
        </h3>
        <div className="flex flex-col space-y-3">
          {steps.map((step, i) => {
            const isLast = i === lastIndex;
            return (
              <div
                key={i}
                className={`bg-background/70 p-4 rounded-md opacity-0 animate-step-in ${isLast ? 'border-2 border-primary/30' : 'border border-border/50'}`}
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
                  {step.label}
                </p>
                {step.formula && (
                  <p className="text-sm font-heading text-foreground mb-1 italic">{step.formula}</p>
                )}
                <p className={`font-body text-foreground ${isLast ? 'text-lg font-extrabold text-primary' : 'text-sm'}`}>
                  {step.result}
                </p>
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
