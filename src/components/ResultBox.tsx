interface ResultBoxProps {
  label: string;
  value: string;
  classification?: string;
}

export function ResultBox({ label, value, classification }: ResultBoxProps) {
  return (
    <div className="border-2 border-foreground p-6 mb-6">
      <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-3xl font-heading font-bold text-accent">{value}</p>
      {classification && (
        <p className="text-lg font-heading font-bold text-accent mt-1">{classification}</p>
      )}
    </div>
  );
}
