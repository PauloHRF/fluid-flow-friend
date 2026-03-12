interface FluidPreset {
  name: string;
  rho: string;
  mu: string;
}

const fluids: FluidPreset[] = [
  { name: "Água (20 °C)", rho: "998", mu: "0.001002" },
  { name: "Ar (20 °C, 1 atm)", rho: "1.204", mu: "0.0000181" },
  { name: "Mercúrio", rho: "13600", mu: "0.00155" },
  { name: "Óleo SAE 30", rho: "891", mu: "0.29" },
  { name: "Gasolina", rho: "720", mu: "0.00029" },
  { name: "Glicerina", rho: "1261", mu: "1.412" },
];

interface FluidPresetsProps {
  onSelect: (rho: string, mu: string) => void;
}

export function FluidPresets({ onSelect }: FluidPresetsProps) {
  return (
    <div className="mb-4">
      <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">
        Fluido Pré-definido
      </label>
      <select
        defaultValue=""
        onChange={(e) => {
          const fluid = fluids.find((f) => f.name === e.target.value);
          if (fluid) onSelect(fluid.rho, fluid.mu);
        }}
        className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none"
      >
        <option value="" disabled>Selecione um fluido...</option>
        {fluids.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name} — ρ={f.rho} kg/m³, μ={f.mu} Pa·s
          </option>
        ))}
      </select>
    </div>
  );
}
