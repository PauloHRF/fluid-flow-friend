import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

type Shape = "custom" | "cilindro" | "esfera" | "paralelepipedo";

export default function EmpuxoPage() {
  const [shape, setShape] = useState<Shape>("custom");
  const [volume, setVolume] = useState("");
  const [massa, setMassa] = useState("");
  const [rhoFluido, setRhoFluido] = useState("1000");
  const [raio, setRaio] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [factors, setFactors] = useState<Record<string, number>>({});
  const setFactor = (key: string, factor: number) => setFactors((prev) => ({ ...prev, [key]: factor }));

  const [result, setResult] = useState<{ empuxo: number; peso: number; laudo: string; volSubmerso: number; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;
  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const calculate = () => {
    const e: Record<string, string> = {};
    if (!massa || isNaN(parseFloat(massa))) e.massa = "Campo obrigatório";
    if (!rhoFluido || isNaN(parseFloat(rhoFluido)) || parseFloat(rhoFluido) === 0) e.rhoFluido = "Deve ser > 0";

    if (shape === "custom" && (!volume || isNaN(parseFloat(volume)))) e.volume = "Campo obrigatório";
    if ((shape === "cilindro" || shape === "esfera") && (!raio || isNaN(parseFloat(raio)))) e.raio = "Campo obrigatório";
    if ((shape === "cilindro" || shape === "paralelepipedo") && (!altura || isNaN(parseFloat(altura)))) e.altura = "Campo obrigatório";
    if (shape === "paralelepipedo") {
      if (!comprimento || isNaN(parseFloat(comprimento))) e.comprimento = "Campo obrigatório";
      if (!largura || isNaN(parseFloat(largura))) e.largura = "Campo obrigatório";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const m = parseFloat(massa) * (factors.massa || 1);
    const rhoF = parseFloat(rhoFluido) * (factors.rhoFluido || 1);
    const steps: any[] = [];
    let vol: number;

    steps.push({ label: "Dados de Entrada", type: "info", result: `Massa = ${m} kg | ρ_fluido = ${rhoF} kg/m³ | g = ${g} m/s²` });

    switch (shape) {
      case "cilindro": { const r = parseFloat(raio) * (factors.raio || 1); const h = parseFloat(altura) * (factors.altura || 1); vol = Math.PI * r ** 2 * h; steps.push({ label: "Volume do Cilindro", type: "substitution", formula: `V = \\pi \\cdot r^2 \\cdot h`, substitution: `V = \\pi \\cdot ${r}^2 \\cdot ${h} = ${vol.toFixed(6)} \\text{ m}^3`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      case "esfera": { const r = parseFloat(raio) * (factors.raio || 1); vol = (4 / 3) * Math.PI * r ** 3; steps.push({ label: "Volume da Esfera", type: "substitution", formula: `V = \\frac{4}{3} \\cdot \\pi \\cdot r^3`, substitution: `V = \\frac{4}{3} \\cdot \\pi \\cdot ${r}^3 = ${vol.toFixed(6)} \\text{ m}^3`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      case "paralelepipedo": { const c = parseFloat(comprimento) * (factors.comprimento || 1); const l = parseFloat(largura) * (factors.largura || 1); const h = parseFloat(altura) * (factors.altura || 1); vol = c * l * h; steps.push({ label: "Volume do Paralelepípedo", type: "substitution", formula: `V = C \\cdot L \\cdot H`, substitution: `V = ${c} \\times ${l} \\times ${h} = ${vol.toFixed(6)} \\text{ m}^3`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      default: { vol = parseFloat(volume) * (factors.volume || 1); steps.push({ label: "Volume Informado", type: "info", result: `V = ${vol} m³` }); }
    }

    const peso = m * g;
    const rhoObj = m / vol;
    let laudo: string; let volSubmerso: number;

    if (rhoObj < rhoF) { volSubmerso = m / rhoF; laudo = "O objeto vai BOIAR 🟢"; }
    else if (rhoObj === rhoF) { volSubmerso = vol; laudo = "Equilíbrio Neutro 🟡"; }
    else { volSubmerso = vol; laudo = "O objeto vai AFUNDAR 🔴"; }

    const empuxo = rhoF * volSubmerso * g;

    steps.push({ label: "Peso do Objeto", type: "substitution", formula: `W = m \\cdot g`, substitution: `W = ${m} \\times ${g} = ${peso.toFixed(4)} \\text{ N}`, result: `W = ${peso.toFixed(4)} N` });
    steps.push({ label: "Densidade do Objeto", type: "substitution", formula: `\\rho_{obj} = \\frac{m}{V}`, substitution: `\\rho_{obj} = \\frac{${m}}{${vol.toFixed(6)}} = ${rhoObj.toFixed(2)} \\text{ kg/m}^3`, result: `ρ_obj = ${rhoObj.toFixed(2)} kg/m³` });
    steps.push({ label: "Comparação de Densidades", type: "info", result: `ρ_obj (${rhoObj.toFixed(2)}) ${rhoObj < rhoF ? "<" : rhoObj === rhoF ? "=" : ">"} ρ_fluido (${rhoF}) → ${rhoObj < rhoF ? "Objeto menos denso que o fluido" : rhoObj === rhoF ? "Densidades iguais" : "Objeto mais denso que o fluido"}` });
    steps.push({ label: "Volume Submerso", type: "substitution", formula: rhoObj < rhoF ? `V_{sub} = \\frac{m}{\\rho_{fluido}}` : `V_{sub} = V \\text{ (totalmente submerso)}`, substitution: rhoObj < rhoF ? `V_{sub} = \\frac{${m}}{${rhoF}} = ${volSubmerso.toFixed(6)} \\text{ m}^3` : `V_{sub} = ${vol.toFixed(6)} \\text{ m}^3`, result: `V_sub = ${volSubmerso.toFixed(6)} m³` });
    steps.push({ label: "Força de Empuxo (Princípio de Arquimedes)", type: "substitution", formula: `E = \\rho_{fluido} \\cdot V_{sub} \\cdot g`, substitution: `E = ${rhoF} \\times ${volSubmerso.toFixed(6)} \\times ${g} = ${empuxo.toFixed(4)} \\text{ N}`, result: `E = ${empuxo.toFixed(4)} N` });
    steps.push({ label: "Laudo Final", type: "verdict", result: laudo });

    setResult({ empuxo, peso, laudo, volSubmerso, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Força de Empuxo — Arquimedes" metaDescription="Calcule a força de empuxo, volume submerso e determine se um objeto flutua ou afunda. Memorial de cálculo passo a passo.">
      <div className="mb-4">
        <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">Formato do Objeto</label>
        <select value={shape} onChange={(e) => { setShape(e.target.value as Shape); setResult(null); }} className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none">
          <option value="custom">Volume direto</option>
          <option value="cilindro">Cilindro</option>
          <option value="esfera">Esfera</option>
          <option value="paralelepipedo">Paralelepípedo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {shape === "custom" && <InputField label="Volume" unit="m³" value={volume} onChange={(v) => { setVolume(v); clearError("volume"); }} error={errors.volume} unitGroup="volume" onUnitFactorChange={(f) => setFactor("volume", f)} />}
        {(shape === "cilindro" || shape === "esfera") && <InputField label="Raio" unit="m" value={raio} onChange={(v) => { setRaio(v); clearError("raio"); }} error={errors.raio} unitGroup="length" onUnitFactorChange={(f) => setFactor("raio", f)} />}
        {(shape === "cilindro" || shape === "paralelepipedo") && <InputField label="Altura" unit="m" value={altura} onChange={(v) => { setAltura(v); clearError("altura"); }} error={errors.altura} unitGroup="length" onUnitFactorChange={(f) => setFactor("altura", f)} />}
        {shape === "paralelepipedo" && (
          <>
            <InputField label="Comprimento" unit="m" value={comprimento} onChange={(v) => { setComprimento(v); clearError("comprimento"); }} error={errors.comprimento} unitGroup="length" onUnitFactorChange={(f) => setFactor("comprimento", f)} />
            <InputField label="Largura" unit="m" value={largura} onChange={(v) => { setLargura(v); clearError("largura"); }} error={errors.largura} unitGroup="length" onUnitFactorChange={(f) => setFactor("largura", f)} />
          </>
        )}
        <InputField label="Massa do Objeto" unit="kg" value={massa} onChange={(v) => { setMassa(v); clearError("massa"); }} error={errors.massa} unitGroup="mass" onUnitFactorChange={(f) => setFactor("massa", f)} />
        <InputField label="Densidade do Fluido" unit="kg/m³" value={rhoFluido} onChange={(v) => { setRhoFluido(v); clearError("rhoFluido"); }} error={errors.rhoFluido} unitGroup="density" onUnitFactorChange={(f) => setFactor("rhoFluido", f)} />
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.empuxo}>
          <ResultBox label="Força de Empuxo" value={`${result.empuxo.toFixed(4)} N`} classification={result.laudo} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">O Princípio de Arquimedes e a Força de Flutuação (Empuxo)</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">A força de empuxo é o fenômeno hidrostático que dita a estabilidade e a flutuação de corpos imersos em fluidos.</p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">A análise de flutuabilidade exige o cruzamento direto de densidades. Esse cálculo é a base da engenharia naval, dimensionamento de balsas, boias de nível e hidrômetros.</p>
      </div>
    </CalculatorLayout>
  );
}
