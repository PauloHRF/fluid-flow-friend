import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

type InputMode = "area" | "diametro";

export default function ContinuidadePage() {
  const [mode, setMode] = useState<InputMode>("diametro");
  const [compressivel, setCompressivel] = useState(false);

  const [A1, setA1] = useState("");
  const [A2, setA2] = useState("");
  const [D1, setD1] = useState("");
  const [D2, setD2] = useState("");
  const [V1, setV1] = useState("");
  const [V2, setV2] = useState("");
  const [rho1, setRho1] = useState("1000");
  const [rho2, setRho2] = useState("1000");

  const [incognita, setIncognita] = useState<"V1" | "V2" | "A1" | "A2">("V2");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: number; label: string; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const areaFromDiam = (d: number) => Math.PI * (d / 2) ** 2;
  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const calculate = () => {
    const e: Record<string, string> = {};
    let a1: number, a2: number;

    if (mode === "diametro") {
      const d1 = parseFloat(D1); const d2 = parseFloat(D2);
      if (incognita !== "A1" && (isNaN(d1))) e.D1 = "Campo obrigatório";
      if (incognita !== "A2" && (isNaN(d2))) e.D2 = "Campo obrigatório";
      if (Object.keys(e).length > 0) { setErrors(e); return; }
      a1 = areaFromDiam(d1); a2 = areaFromDiam(d2);
    } else {
      a1 = parseFloat(A1); a2 = parseFloat(A2);
      if (incognita !== "A1" && isNaN(a1)) e.A1 = "Campo obrigatório";
      if (incognita !== "A2" && isNaN(a2)) e.A2 = "Campo obrigatório";
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }

    const v1 = parseFloat(V1); const v2 = parseFloat(V2);
    if (incognita !== "V1" && isNaN(v1)) e.V1 = "Campo obrigatório";
    if (incognita !== "V2" && isNaN(v2)) e.V2 = "Campo obrigatório";

    const density1 = parseFloat(rho1); const density2 = parseFloat(rho2);
    if (compressivel) {
      if (isNaN(density1)) e.rho1 = "Campo obrigatório";
      if (isNaN(density2)) e.rho2 = "Campo obrigatório";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const steps: any[] = [];
    let solved: number;
    let solvedLabel: string;

    if (mode === "diametro") {
      const d1 = parseFloat(D1); const d2 = parseFloat(D2);
      steps.push({ label: "Conversão Diâmetro → Área", formula: "A = π × (D/2)²", result: `A₁ = ${a1!.toFixed(6)} m² | A₂ = ${a2!.toFixed(6)} m²` });
    }

    if (compressivel) {
      steps.push({ label: "Equação da Continuidade (Compressível)", formula: "ρ₁ × A₁ × V₁ = ρ₂ × A₂ × V₂", result: `Com ρ₁ = ${density1} kg/m³ e ρ₂ = ${density2} kg/m³` });
      switch (incognita) {
        case "V2": solved = (density1 * a1! * v1) / (density2 * a2!); solvedLabel = "Velocidade V₂"; break;
        case "V1": solved = (density2 * a2! * v2) / (density1 * a1!); solvedLabel = "Velocidade V₁"; break;
        case "A1": solved = (density2 * a2! * v2) / (density1 * v1); solvedLabel = "Área A₁"; break;
        case "A2": solved = (density1 * a1! * v1) / (density2 * v2); solvedLabel = "Área A₂"; break;
        default: return;
      }
    } else {
      steps.push({ label: "Equação da Continuidade (Incompressível)", formula: "A₁ × V₁ = A₂ × V₂ → Q = constante", result: "Para fluido incompressível, a vazão volumétrica é constante." });
      switch (incognita) {
        case "V2": solved = (a1! * v1) / a2!; solvedLabel = "Velocidade V₂"; break;
        case "V1": solved = (a2! * v2) / a1!; solvedLabel = "Velocidade V₁"; break;
        case "A1": solved = (a2! * v2) / v1; solvedLabel = "Área A₁"; break;
        case "A2": solved = (a1! * v1) / v2; solvedLabel = "Área A₂"; break;
        default: return;
      }
    }

    const Q = a1! * (incognita === "V1" ? solved : v1);
    steps.push({ label: "Substituição", result: `${incognita} = ${solved.toFixed(6)} ${incognita.startsWith("V") ? "m/s" : "m²"}` });
    steps.push({ label: "Vazão Volumétrica", formula: "Q = A × V", result: `Q = ${Q.toFixed(6)} m³/s` });

    setResult({ value: solved, label: solvedLabel!, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Equação da Continuidade" metaDescription="Resolva a Equação da Continuidade para velocidade, área ou vazão volumétrica em fluidos compressíveis e incompressíveis.">
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-foreground cursor-pointer">
          <input type="radio" checked={mode === "diametro"} onChange={() => setMode("diametro")} className="accent-primary" /> Entrada por Diâmetro
        </label>
        <label className="flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-foreground cursor-pointer">
          <input type="radio" checked={mode === "area"} onChange={() => setMode("area")} className="accent-primary" /> Entrada por Área
        </label>
        <label className="flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-foreground cursor-pointer ml-4">
          <input type="checkbox" checked={compressivel} onChange={(e) => setCompressivel(e.target.checked)} className="accent-primary" /> Fluido Compressível
        </label>
      </div>

      <div className="mb-4">
        <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">Incógnita</label>
        <select value={incognita} onChange={(e) => { setIncognita(e.target.value as any); setResult(null); }} className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none">
          <option value="V2">Velocidade V₂</option>
          <option value="V1">Velocidade V₁</option>
          <option value="A1">Área A₁</option>
          <option value="A2">Área A₂</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {mode === "diametro" ? (
          <>
            {incognita !== "A1" && <InputField label="Diâmetro D₁" unit="m" value={D1} onChange={(v) => { setD1(v); clearError("D1"); }} error={errors.D1} />}
            {incognita !== "A2" && <InputField label="Diâmetro D₂" unit="m" value={D2} onChange={(v) => { setD2(v); clearError("D2"); }} error={errors.D2} />}
          </>
        ) : (
          <>
            {incognita !== "A1" && <InputField label="Área A₁" unit="m²" value={A1} onChange={(v) => { setA1(v); clearError("A1"); }} error={errors.A1} />}
            {incognita !== "A2" && <InputField label="Área A₂" unit="m²" value={A2} onChange={(v) => { setA2(v); clearError("A2"); }} error={errors.A2} />}
          </>
        )}
        {incognita !== "V1" && <InputField label="Velocidade V₁" unit="m/s" value={V1} onChange={(v) => { setV1(v); clearError("V1"); }} error={errors.V1} />}
        {incognita !== "V2" && <InputField label="Velocidade V₂" unit="m/s" value={V2} onChange={(v) => { setV2(v); clearError("V2"); }} error={errors.V2} />}
        {compressivel && (
          <>
            <InputField label="Densidade ρ₁" unit="kg/m³" value={rho1} onChange={(v) => { setRho1(v); clearError("rho1"); }} error={errors.rho1} />
            <InputField label="Densidade ρ₂" unit="kg/m³" value={rho2} onChange={(v) => { setRho2(v); clearError("rho2"); }} error={errors.rho2} />
          </>
        )}
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.value}>
          <ResultBox label={result.label} value={`${result.value.toFixed(6)} ${incognita.startsWith("V") ? "m/s" : "m²"}`} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Entendendo a Equação da Continuidade e a Conservação da Massa</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">Na mecânica dos fluidos, a Equação da Continuidade é a expressão matemática do princípio da conservação da massa para um volume de controle. Em termos práticos de engenharia, isso significa que a massa de fluido que entra em uma tubulação deve ser exatamente igual à massa que sai, assumindo que não há acúmulo no sistema. Para fluidos incompressíveis (como a água na maioria das aplicações prediais e industriais), a densidade permanece constante, o que simplifica a equação para a conservação da vazão volumétrica (Q = A × V).</p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">Reduções no diâmetro da tubulação (estreitamentos) forçam o fluido a aumentar a sua velocidade de escoamento para que a mesma vazão consiga passar pela seção transversal menor. Compreender essa relação entre área geométrica e campo de velocidade é o primeiro passo para dimensionar sistemas de recalque e prever o comportamento dinâmico de qualquer fluido em movimento.</p>
      </div>
    </CalculatorLayout>
  );
}
