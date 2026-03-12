import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep } from "@/components/StepByStep";
import { FluidPresets } from "@/components/FluidPresets";

export default function DarcyWeisbachPage() {
  const [f, setF] = useState("");
  const [L, setL] = useState("");
  const [D, setD] = useState("");
  const [v, setV] = useState("");
  const [epsilon, setEpsilon] = useState("");
  const [rho, setRho] = useState("1000");
  const [mu, setMu] = useState("0.001");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ hf: number; friction: number; re: number; steps: any[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const calculate = () => {
    const e: Record<string, string> = {};
    if (!L || isNaN(parseFloat(L))) e.L = "Campo obrigatório";
    if (!D || isNaN(parseFloat(D)) || parseFloat(D) === 0) e.D = "Deve ser > 0";
    if (!v || isNaN(parseFloat(v))) e.v = "Campo obrigatório";
    if (!epsilon || isNaN(parseFloat(epsilon))) e.epsilon = "Campo obrigatório";
    if (!rho || isNaN(parseFloat(rho))) e.rho = "Campo obrigatório";
    if (!mu || isNaN(parseFloat(mu)) || parseFloat(mu) === 0) e.mu = "Deve ser > 0";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const fVal = parseFloat(f);
    const length = parseFloat(L);
    const diameter = parseFloat(D);
    const velocity = parseFloat(v);
    const roughness = parseFloat(epsilon);
    const density = parseFloat(rho);
    const viscosity = parseFloat(mu);

    const re = (density * velocity * diameter) / viscosity;
    const relRoughness = roughness / diameter;

    let friction: number;
    if (!isNaN(fVal) && fVal > 0) {
      friction = fVal;
    } else {
      if (re < 2300) {
        friction = 64 / re;
      } else {
        const A = relRoughness / 3.7;
        const B = 5.74 / Math.pow(re, 0.9);
        friction = 0.25 / Math.pow(Math.log10(A + B), 2);
      }
    }

    const hf = friction * (length / diameter) * (velocity ** 2) / (2 * g);

    const steps = [
      { label: "Número de Reynolds", formula: "Re = (ρ × v × D) / μ", result: `Re = (${density} × ${velocity} × ${diameter}) / ${viscosity} = ${re.toFixed(2)}` },
      { label: "Rugosidade Relativa", formula: "ε/D", result: `ε/D = ${roughness} / ${diameter} = ${relRoughness.toFixed(6)}` },
      { label: "Fator de Atrito (f)", formula: re < 2300 ? "f = 64 / Re (laminar)" : "Aprox. Swamee-Jain", result: !isNaN(fVal) && fVal > 0 ? `f = ${friction.toFixed(6)} (fornecido)` : `f = ${friction.toFixed(6)} (calculado)` },
      { label: "Equação de Darcy-Weisbach", formula: "hf = f × (L/D) × (v²/2g)", result: `hf = ${friction.toFixed(6)} × (${length}/${diameter}) × (${velocity}²/(2×${g}))` },
      { label: "Resultado Final", result: `hf = ${hf.toFixed(4)} m` },
    ];

    setResult({ hf, friction, re, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Perda de Carga — Darcy-Weisbach" metaDescription="Calcule a perda de carga distribuída pela equação de Darcy-Weisbach com fator de atrito automático via Swamee-Jain.">
      <FluidPresets onSelect={(r, m) => { setRho(r); setMu(m); }} />
      <p className="text-xs font-body text-muted-foreground mb-4">Deixe o fator de atrito (f) em branco para cálculo automático via Swamee-Jain.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InputField label="Fator de Atrito (f)" unit="adimensional" value={f} onChange={setF} />
        <InputField label="Comprimento (L)" unit="m" value={L} onChange={(v) => { setL(v); clearError("L"); }} error={errors.L} />
        <InputField label="Diâmetro (D)" unit="m" value={D} onChange={(v) => { setD(v); clearError("D"); }} error={errors.D} />
        <InputField label="Velocidade (v)" unit="m/s" value={v} onChange={(val) => { setV(val); clearError("v"); }} error={errors.v} />
        <InputField label="Rugosidade (ε)" unit="m" value={epsilon} onChange={(v) => { setEpsilon(v); clearError("epsilon"); }} error={errors.epsilon} />
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={(v) => { setRho(v); clearError("rho"); }} error={errors.rho} />
        <InputField label="Viscosidade (μ)" unit="Pa·s" value={mu} onChange={(v) => { setMu(v); clearError("mu"); }} error={errors.mu} />
      </div>

      <button onClick={calculate} className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8">Calcular</button>

      {result && (
        <div key={result.hf}>
          <ResultBox label="Perda de Carga (hf)" value={`${result.hf.toFixed(4)} m`} />
          <ResultBox label="Fator de Atrito (f)" value={result.friction.toFixed(6)} />
          <button onClick={() => setShowSteps(!showSteps)} className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4">
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">
          Cálculo da Perda de Carga e a Equação de Darcy-Weisbach
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Em qualquer sistema industrial de transporte de fluidos, o atrito entre o líquido e a parede interna da tubulação causa uma dissipação contínua de energia, conhecida como perda de carga distribuída. A Equação de Darcy-Weisbach é o método mais rigoroso e universalmente aceito na engenharia para quantificar essa perda. Ela relaciona a energia dissipada com o comprimento e o diâmetro do tubo, a velocidade média do escoamento e o fator de atrito (f).
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A determinação exata do fator de atrito é o coração do cálculo. Para escoamentos laminares, ele depende exclusivamente do Número de Reynolds. No entanto, para escoamentos turbulentos, o fator de atrito torna-se uma função complexa que envolve tanto a turbulência do fluido quanto a rugosidade relativa do material do tubo (PVC, aço galvanizado, ferro fundido), sendo tipicamente resolvido através do Diagrama de Moody ou da Equação de Colebrook-White. O correto dimensionamento dessa perda de energia é o que define a potência mecânica exigida da bomba centrífuga da instalação.
        </p>
      </div>
    </CalculatorLayout>
  );
}
