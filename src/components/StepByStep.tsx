interface Step {
  label: string;
  formula?: string;
  result: string;
}

interface StepByStepProps {
  steps: Step[];
}

export function StepByStep({ steps }: StepByStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-foreground">
        Passo a Passo
      </h3>
      {steps.map((step, i) => (
        <div
          key={i}
          className="border border-foreground bg-card p-4 opacity-0 animate-step-in"
          style={{ animationDelay: `${(i + 1) * 100}ms` }}
        >
          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1">
            {step.label}
          </p>
          {step.formula && (
            <p className="text-sm font-heading text-foreground mb-1">{step.formula}</p>
          )}
          <p className="text-sm font-body text-foreground">{step.result}</p>
        </div>
      ))}
    </div>
  );
}
