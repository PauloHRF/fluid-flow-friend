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

    const m = parseFloat(massa);
    const rhoF = parseFloat(rhoFluido);
    const steps: any[] = [];
    let vol: number;

    steps.push({ label: "Dados de Entrada", type: "info", result: `Massa = ${m} kg | ρ_fluido = ${rhoF} kg/m³ | g = ${g} m/s²` });

    switch (shape) {
      case "cilindro": { const r = parseFloat(raio); const h = parseFloat(altura); vol = Math.PI * r ** 2 * h; steps.push({ label: "Volume do Cilindro", type: "substitution", formula: "V = π × r² × h", substitution: `V = π × ${r}² × ${h}`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      case "esfera": { const r = parseFloat(raio); vol = (4 / 3) * Math.PI * r ** 3; steps.push({ label: "Volume da Esfera", type: "substitution", formula: "V = (4/3) × π × r³", substitution: `V = (4/3) × π × ${r}³`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      case "paralelepipedo": { const c = parseFloat(comprimento); const l = parseFloat(largura); const h = parseFloat(altura); vol = c * l * h; steps.push({ label: "Volume do Paralelepípedo", type: "substitution", formula: "V = C × L × H", substitution: `V = ${c} × ${l} × ${h}`, result: `V = ${vol.toFixed(6)} m³` }); break; }
      default: { vol = parseFloat(volume); steps.push({ label: "Volume Informado", type: "info", result: `V = ${vol} m³` }); }
    }

    const peso = m * g;
    const rhoObj = m / vol;
    let laudo: string; let volSubmerso: number;

    if (rhoObj < rhoF) { volSubmerso = m / rhoF; laudo = "O objeto vai BOIAR 🟢"; }
    else if (rhoObj === rhoF) { volSubmerso = vol; laudo = "Equilíbrio Neutro 🟡"; }
    else { volSubmerso = vol; laudo = "O objeto vai AFUNDAR 🔴"; }

    const empuxo = rhoF * volSubmerso * g;

    steps.push({ label: "Peso do Objeto", type: "substitution", formula: "W = m × g", substitution: `W = ${m} × ${g}`, result: `W = ${peso.toFixed(4)} N` });
    steps.push({ label: "Densidade do Objeto", type: "substitution", formula: "ρ_obj = m / V", substitution: `ρ_obj = ${m} / ${vol.toFixed(6)}`, result: `ρ_obj = ${rhoObj.toFixed(2)} kg/m³` });
    steps.push({ label: "Comparação de Densidades", type: "info", result: `ρ_obj (${rhoObj.toFixed(2)}) ${rhoObj < rhoF ? "<" : rhoObj === rhoF ? "=" : ">"} ρ_fluido (${rhoF}) → ${rhoObj < rhoF ? "Objeto menos denso que o fluido" : rhoObj === rhoF ? "Densidades iguais" : "Objeto mais denso que o fluido"}` });
    steps.push({ label: "Volume Submerso", type: "substitution", formula: rhoObj < rhoF ? "V_sub = m / ρ_fluido" : "V_sub = V (totalmente submerso)", substitution: rhoObj < rhoF ? `V_sub = ${m} / ${rhoF}` : `V_sub = ${vol.toFixed(6)}`, result: `V_sub = ${volSubmerso.toFixed(6)} m³` });
    steps.push({ label: "Força de Empuxo (Princípio de Arquimedes)", type: "substitution", formula: "E = ρ_fluido × V_sub × g", substitution: `E = ${rhoF} × ${volSubmerso.toFixed(6)} × ${g}`, result: `E = ${empuxo.toFixed(4)} N` });
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
        {shape === "custom" && <InputField label="Volume" unit="m³" value={volume} onChange={(v) => { setVolume(v); clearError("volume"); }} error={errors.volume} />}
        {(shape === "cilindro" || shape === "esfera") && <InputField label="Raio" unit="m" value={raio} onChange={(v) => { setRaio(v); clearError("raio"); }} error={errors.raio} />}
        {(shape === "cilindro" || shape === "paralelepipedo") && <InputField label="Altura" unit="m" value={altura} onChange={(v) => { setAltura(v); clearError("altura"); }} error={errors.altura} />}
        {shape === "paralelepipedo" && (
          <>
            <InputField label="Comprimento" unit="m" value={comprimento} onChange={(v) => { setComprimento(v); clearError("comprimento"); }} error={errors.comprimento} />
            <InputField label="Largura" unit="m" value={largura} onChange={(v) => { setLargura(v); clearError("largura"); }} error={errors.largura} />
          </>
        )}
        <InputField label="Massa do Objeto" unit="kg" value={massa} onChange={(v) => { setMassa(v); clearError("massa"); }} error={errors.massa} />
        <InputField label="Densidade do Fluido" unit="kg/m³" value={rhoFluido} onChange={(v) => { setRhoFluido(v); clearError("rhoFluido"); }} error={errors.rhoFluido} />
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
        <p className="text-sm font-body text-muted-foreground leading-relaxed">A força de empuxo é o fenômeno hidrostático que dita a estabilidade e a flutuação de corpos imersos em fluidos. Pelo Princípio de Arquimedes, qualquer objeto parcial ou totalmente submerso experimenta uma força vertical ascendente, cuja magnitude é exatamente igual ao peso do volume do fluido que foi deslocado pelo corpo.</p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">A análise de flutuabilidade exige o cruzamento direto de densidades. Se a densidade média do objeto for superior à densidade do fluido, a força peso supera o empuxo máximo possível, resultando no afundamento. Caso a densidade do corpo seja inferior à do líquido, ocorre a flutuação, e o sistema encontra equilíbrio quando a fração do volume submerso desloca a exata quantidade de fluido necessária para igualar a força peso total do corpo. Esse cálculo é a base da engenharia naval, dimensionamento de balsas, boias de nível e hidrômetros.</p>
      </div>
    </CalculatorLayout>
  );
}
