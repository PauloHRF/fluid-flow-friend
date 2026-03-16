import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";

export default function NPSHPage() {
  const [Patm, setPatm] = useState("101325");
  const [Pvapor, setPvapor] = useState("");
  const [hSuccao, setHSuccao] = useState("");
  const [hPerdas, setHPerdas] = useState("");
  const [vSuccao, setVSuccao] = useState("");
  const [rho, setRho] = useState("1000");
  const [NPSHr, setNPSHr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [result, setResult] = useState<{
    npshd: number;
    npshr: number | null;
    cavita: boolean | null;
    steps: any[];
  } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;
  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const calculate = () => {
    const e: Record<string, string> = {};
    if (!Patm || isNaN(parseFloat(Patm))) e.Patm = "Campo obrigatório";
    if (!Pvapor || isNaN(parseFloat(Pvapor))) e.Pvapor = "Campo obrigatório";
    if (!hSuccao || isNaN(parseFloat(hSuccao))) e.hSuccao = "Campo obrigatório";
    if (!hPerdas || isNaN(parseFloat(hPerdas))) e.hPerdas = "Campo obrigatório";
    if (!vSuccao || isNaN(parseFloat(vSuccao))) e.vSuccao = "Campo obrigatório";
    if (!rho || isNaN(parseFloat(rho)) || parseFloat(rho) === 0) e.rho = "Deve ser > 0";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const patm = parseFloat(Patm);
    const pvap = parseFloat(Pvapor);
    const hs = parseFloat(hSuccao);
    const hp = parseFloat(hPerdas);
    const vs = parseFloat(vSuccao);
    const density = parseFloat(rho);
    const npshr = parseFloat(NPSHr);
    const hasNPSHr = !isNaN(npshr) && npshr > 0;

    const pressureHead = (patm - pvap) / (density * g);
    const velocityHead = vs ** 2 / (2 * g);
    const npshd = pressureHead - hs - hp + velocityHead;

    const steps: any[] = [
      { label: "Dados de Entrada", type: "info", result: `Patm = ${patm} Pa | Pvapor = ${pvap} Pa | hs = ${hs} m | hperdas = ${hp} m | v = ${vs} m/s | ρ = ${density} kg/m³` },
      { label: "Fórmula do NPSH Disponível", type: "formula", formula: `\\text{NPSH}_d = \\frac{P_{atm} - P_{vapor}}{\\rho \\cdot g} - h_s - h_{perdas} + \\frac{v^2}{2g}`, result: "Energia líquida positiva de sucção disponível na instalação." },
      { label: "Carga de Pressão", type: "substitution", formula: `\\frac{P_{atm} - P_{vapor}}{\\rho \\cdot g}`, substitution: `\\frac{${patm} - ${pvap}}{${density} \\times ${g}} = ${pressureHead.toFixed(4)} \\text{ m}`, result: `Carga de pressão = ${pressureHead.toFixed(4)} m` },
      { label: "Altura Geométrica de Sucção", type: "info", result: `hs = ${hs} m (distância vertical entre reservatório e bomba)` },
      { label: "Perdas de Carga na Sucção", type: "info", result: `hperdas = ${hp} m (perdas distribuídas + localizadas na tubulação de sucção)` },
      { label: "Carga de Velocidade", type: "substitution", formula: `\\frac{v^2}{2g}`, substitution: `\\frac{${vs}^2}{2 \\times ${g}} = ${velocityHead.toFixed(4)} \\text{ m}`, result: `Carga de velocidade = ${velocityHead.toFixed(4)} m` },
      { label: "Cálculo do NPSH Disponível", type: "substitution", formula: `\\text{NPSH}_d = \\frac{P_{atm} - P_{vapor}}{\\rho g} - h_s - h_{perdas} + \\frac{v^2}{2g}`, substitution: `\\text{NPSH}_d = ${pressureHead.toFixed(4)} - ${hs} - ${hp} + ${velocityHead.toFixed(4)} = ${npshd.toFixed(4)} \\text{ m}`, result: `NPSHd = ${npshd.toFixed(4)} m` },
    ];

    let cavita: boolean | null = null;
    if (hasNPSHr) {
      cavita = npshd < npshr;
      steps.push({ label: "Comparação NPSHd vs NPSHr", type: "info", result: `NPSHd (${npshd.toFixed(4)} m) ${cavita ? "<" : "≥"} NPSHr (${npshr} m)` });
      steps.push({ label: "Laudo Final", type: "verdict", result: cavita ? "🔴 ALERTA: A bomba VAI CAVITAR! NPSHd < NPSHr." : "🟢 SEGURO: NPSHd ≥ NPSHr. A bomba opera sem cavitação." });
    }

    setResult({ npshd, npshr: hasNPSHr ? npshr : null, cavita, steps });
    setShowSteps(false);
  };

  const cavitaClass = result?.cavita === true;

  return (
    <CalculatorLayout title="NPSH e Cavitação — Sistema de Bombas" metaDescription="Calcule o NPSH Disponível e diagnostique cavitação em bombas centrífugas com memorial de cálculo passo a passo.">
      <p className="text-xs font-body text-muted-foreground mb-4">
        Informe o NPSH requerido (dado pelo fabricante da bomba) para obter o diagnóstico de cavitação.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InputField label="Pressão Atmosférica" unit="Pa" value={Patm} onChange={(v) => { setPatm(v); clearError("Patm"); }} error={errors.Patm} />
        <InputField label="Pressão de Vapor" unit="Pa" value={Pvapor} onChange={(v) => { setPvapor(v); clearError("Pvapor"); }} error={errors.Pvapor} />
        <InputField label="Altura de Sucção (hs)" unit="m" value={hSuccao} onChange={(v) => { setHSuccao(v); clearError("hSuccao"); }} error={errors.hSuccao} />
        <InputField label="Perdas na Sucção (hperdas)" unit="m" value={hPerdas} onChange={(v) => { setHPerdas(v); clearError("hPerdas"); }} error={errors.hPerdas} />
        <InputField label="Velocidade na Sucção" unit="m/s" value={vSuccao} onChange={(v) => { setVSuccao(v); clearError("vSuccao"); }} error={errors.vSuccao} />
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={(v) => { setRho(v); clearError("rho"); }} error={errors.rho} />
        <InputField label="NPSH Requerido (fabricante)" unit="m" value={NPSHr} onChange={setNPSHr} />
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.npshd}>
          <div className={cavitaClass ? "border-4 border-destructive p-2 mb-2 animate-pulse" : ""}>
            <ResultBox label="NPSH Disponível" value={`${result.npshd.toFixed(4)} m`} classification={result.cavita === true ? "🔴 ALERTA: CAVITAÇÃO DETECTADA!" : result.cavita === false ? "🟢 Operação Segura" : undefined} />
          </div>
          {result.npshr !== null && <ResultBox label="NPSH Requerido" value={`${result.npshr} m`} />}
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">NPSH e a Prevenção do Fenômeno de Cavitação em Bombas Centrífugas</h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">O NPSH (Net Positive Suction Head) é o principal parâmetro de segurança contra a cavitação em bombas centrífugas.</p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">O engenheiro deve garantir que NPSHd seja estritamente maior que NPSHr para integridade mecânica da bomba.</p>
      </div>
    </CalculatorLayout>
  );
}
