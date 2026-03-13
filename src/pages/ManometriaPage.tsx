import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

interface FluidLayer {
  id: number;
  rho: string;
  h: string;
  direction: "desce" | "sobe";
}

let nextId = 1;

export default function ManometriaPage() {
  const [layers, setLayers] = useState<FluidLayer[]>([
    { id: nextId++, rho: "13600", h: "", direction: "desce" },
    { id: nextId++, rho: "1000", h: "", direction: "sobe" },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ deltaP: number; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const addLayer = () => setLayers([...layers, { id: nextId++, rho: "", h: "", direction: "desce" }]);
  const removeLayer = (id: number) => { if (layers.length <= 1) return; setLayers(layers.filter((l) => l.id !== id)); };
  const updateLayer = (id: number, field: keyof FluidLayer, value: string) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    setErrors((e) => ({ ...e, [`${id}-${field}`]: "" }));
  };

  const calculate = () => {
    const e: Record<string, string> = {};
    layers.forEach((l) => {
      if (!l.rho || isNaN(parseFloat(l.rho))) e[`${l.id}-rho`] = "Obrigatório";
      if (!l.h || isNaN(parseFloat(l.h))) e[`${l.id}-h`] = "Obrigatório";
    });
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const layerSummary = layers.map((l, i) => `Camada ${i+1}: ρ=${l.rho} kg/m³, h=${l.h} m, ${l.direction === "desce" ? "↓ desce" : "↑ sobe"}`).join(" | ");
    const steps: any[] = [
      { label: "Dados de Entrada", type: "info", result: layerSummary },
      { label: "Lei de Stevin", type: "formula", formula: "ΔP = ρ × g × h", result: "A pressão varia linearmente com a profundidade em um fluido estático." },
    ];
    let deltaP = 0;
    layers.forEach((layer, i) => {
      const rho = parseFloat(layer.rho); const h = parseFloat(layer.h);
      const contrib = rho * g * h;
      const sign = layer.direction === "desce" ? 1 : -1;
      deltaP += sign * contrib;
      steps.push({ label: `Camada ${i + 1} (${layer.direction === "desce" ? "↓ desce" : "↑ sobe"})`, type: "substitution", formula: `ΔP_${i+1} = ${sign > 0 ? "+" : "−"} ρ × g × h`, substitution: `ΔP_${i+1} = ${sign > 0 ? "+" : "−"} ${rho} × ${g} × ${h}`, result: `ΔP_${i+1} = ${sign > 0 ? "+" : "−"} ${contrib.toFixed(2)} Pa` });
    });
    const sumExpr = layers.map((layer, i) => { const rho = parseFloat(layer.rho); const h = parseFloat(layer.h); const contrib = rho * g * h; const sign = layer.direction === "desce" ? "+" : "−"; return `${sign} ${contrib.toFixed(2)}`; }).join(" ");
    steps.push({ label: "Soma das Contribuições", type: "calculation", formula: `ΔP = ${sumExpr}`, result: `ΔP = ${deltaP.toFixed(2)} Pa` });
    steps.push({ label: "Resultado Final", type: "result", result: `ΔP = ${deltaP.toFixed(2)} Pa = ${(deltaP / 1000).toFixed(4)} kPa` });

    setResult({ deltaP, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Estática dos Fluidos — Manometria" metaDescription="Calcule diferenças de pressão com manômetros em U usando o Teorema de Stevin. Adicione camadas de fluido e obtenha memorial completo.">
      <p className="text-xs font-body text-muted-foreground mb-4">Adicione as camadas de fluido do manômetro em U. Marque "desce" para colunas que aumentam a pressão e "sobe" para as que diminuem.</p>

      <div className="flex flex-col gap-4 mb-6">
        {layers.map((layer, i) => (
          <div key={layer.id} className="border border-input p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading uppercase tracking-wider text-foreground">Camada {i + 1}</span>
              {layers.length > 1 && <button onClick={() => removeLayer(layer.id)} className="text-xs font-heading text-destructive cursor-pointer uppercase tracking-wider">Remover</button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField label="Densidade (ρ)" unit="kg/m³" value={layer.rho} onChange={(val) => updateLayer(layer.id, "rho", val)} error={errors[`${layer.id}-rho`]} />
              <InputField label="Altura (h)" unit="m" value={layer.h} onChange={(val) => updateLayer(layer.id, "h", val)} error={errors[`${layer.id}-h`]} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading text-foreground uppercase tracking-wider">Direção</label>
                <select value={layer.direction} onChange={(e) => updateLayer(layer.id, "direction", e.target.value)} className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none">
                  <option value="desce">↓ Desce (+P)</option>
                  <option value="sobe">↑ Sobe (−P)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={addLayer} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-3 cursor-pointer">+ Adicionar Camada</button>
        <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer">Calcular</button>
      </div>

      {result && (
        <div key={result.deltaP}>
          <ResultBox label="Diferença de Pressão (ΔP)" value={`${result.deltaP.toFixed(2)} Pa`} />
          <ResultBox label="Em kPa" value={`${(result.deltaP / 1000).toFixed(4)} kPa`} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Estática dos Fluidos e o Teorema de Stevin na Prática</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">A manometria é a técnica fundamental da estática dos fluidos utilizada para calcular variações de pressão em fluidos em repouso. O pilar desta análise é o Teorema de Stevin (Lei de Stevin), que estabelece que a pressão absoluta em um ponto de um fluido estático depende apenas da profundidade (altura da coluna de líquido), da densidade do fluido em questão e da aceleração da gravidade local (ΔP = ρ × g × h).</p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">Em problemas de manômetros diferenciais, tubos em U e piezômetros, a metodologia exige o percurso isobárico ao longo das interfaces dos fluidos. Quando o sentido da medição desce ao longo do tubo, a pressão hidrostática aumenta em proporção ao peso específico do fluido. Quando o caminho de medição sobe, a pressão diminui. O domínio dessa soma e subtração de cargas de pressão é vital para o correto diagnóstico de pressões em vasos de pressão, tanques industriais e redes de distribuição.</p>
      </div>
    </CalculatorLayout>
  );
}
