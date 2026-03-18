import { useState } from "react";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { InputField } from "@/components/InputField";
import { ResultBox } from "@/components/ResultBox";
import { StepByStep, Step } from "@/components/StepByStep";

type Geometria = "retangulo" | "circulo";

export default function ComportasPage() {
  const [geometria, setGeometria] = useState<Geometria>("retangulo");
  const [base, setBase] = useState("");
  const [alturaGeom, setAlturaGeom] = useState("");
  const [raio, setRaio] = useState("");
  const [hCG, setHCG] = useState("");
  const [rhoFluido, setRhoFluido] = useState("1000");
  const [angulo, setAngulo] = useState("90");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [factors, setFactors] = useState<Record<string, number>>({});
  const setFactor = (key: string, factor: number) => setFactors((prev) => ({ ...prev, [key]: factor }));

  const [result, setResult] = useState<{ forca: number; yCP: number; steps: Step[] } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;
  const clearError = (key: string) => setErrors((e) => ({ ...e, [key]: "" }));

  const calculate = () => {
    const e: Record<string, string> = {};

    if (!hCG || isNaN(parseFloat(hCG)) || parseFloat(hCG) <= 0) e.hCG = "Deve ser > 0";
    if (!rhoFluido || isNaN(parseFloat(rhoFluido)) || parseFloat(rhoFluido) <= 0) e.rhoFluido = "Deve ser > 0";
    if (!angulo || isNaN(parseFloat(angulo)) || parseFloat(angulo) <= 0 || parseFloat(angulo) > 90) e.angulo = "Entre 0° e 90°";

    if (geometria === "retangulo") {
      if (!base || isNaN(parseFloat(base)) || parseFloat(base) <= 0) e.base = "Deve ser > 0";
      if (!alturaGeom || isNaN(parseFloat(alturaGeom)) || parseFloat(alturaGeom) <= 0) e.alturaGeom = "Deve ser > 0";
    } else {
      if (!raio || isNaN(parseFloat(raio)) || parseFloat(raio) <= 0) e.raio = "Deve ser > 0";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const rho = parseFloat(rhoFluido) * (factors.rhoFluido || 1);
    const h_cg = parseFloat(hCG) * (factors.hCG || 1);
    const theta = parseFloat(angulo);
    const sinTheta = Math.sin((theta * Math.PI) / 180);

    const steps: Step[] = [];

    steps.push({
      label: "Dados de Entrada",
      type: "info",
      result: `ρ = ${rho} kg/m³ | g = ${g} m/s² | h_CG = ${h_cg} m | θ = ${theta}°`,
    });

    let A: number;
    let Ix: number; // momento de inércia em relação ao eixo centroidal

    if (geometria === "retangulo") {
      const b = parseFloat(base) * (factors.base || 1);
      const h = parseFloat(alturaGeom) * (factors.alturaGeom || 1);
      A = b * h;
      Ix = (b * h ** 3) / 12;

      steps.push({
        label: "Área do Retângulo",
        type: "substitution",
        formula: `A = b \\cdot h`,
        substitution: `A = ${b} \\times ${h} = ${A.toFixed(6)} \\text{ m}^2`,
        result: `A = ${A.toFixed(6)} m²`,
      });

      steps.push({
        label: "Momento de Inércia (eixo centroidal)",
        type: "substitution",
        formula: `I_{x} = \\frac{b \\cdot h^3}{12}`,
        substitution: `I_{x} = \\frac{${b} \\times ${h}^3}{12} = ${Ix.toExponential(4)} \\text{ m}^4`,
        result: `Ix = ${Ix.toExponential(4)} m⁴`,
      });
    } else {
      const r = parseFloat(raio) * (factors.raio || 1);
      A = Math.PI * r ** 2;
      Ix = (Math.PI * r ** 4) / 4;

      steps.push({
        label: "Área do Círculo",
        type: "substitution",
        formula: `A = \\pi \\cdot r^2`,
        substitution: `A = \\pi \\times ${r}^2 = ${A.toFixed(6)} \\text{ m}^2`,
        result: `A = ${A.toFixed(6)} m²`,
      });

      steps.push({
        label: "Momento de Inércia (eixo centroidal)",
        type: "substitution",
        formula: `I_{x} = \\frac{\\pi \\cdot r^4}{4}`,
        substitution: `I_{x} = \\frac{\\pi \\times ${r}^4}{4} = ${Ix.toExponential(4)} \\text{ m}^4`,
        result: `Ix = ${Ix.toExponential(4)} m⁴`,
      });
    }

    // Força resultante: F = ρ g h_CG A
    const F = rho * g * h_cg * A;

    steps.push({
      label: "Força Resultante",
      type: "substitution",
      formula: `F = \\rho \\cdot g \\cdot h_{CG} \\cdot A`,
      substitution: `F = ${rho} \\times ${g} \\times ${h_cg} \\times ${A.toFixed(6)} = ${F.toFixed(4)} \\text{ N}`,
      result: `F = ${F.toFixed(4)} N`,
    });

    // Centro de pressão: y_CP = y_CG + Ix·sin²θ / (y_CG · A)
    // onde y_CG = h_CG / sinθ (distância inclinada até o centroide)
    const y_CG = h_cg / sinTheta;

    steps.push({
      label: "Distância Inclinada ao Centroide",
      type: "substitution",
      formula: `y_{CG} = \\frac{h_{CG}}{\\sin\\theta}`,
      substitution: `y_{CG} = \\frac{${h_cg}}{\\sin(${theta}°)} = ${y_CG.toFixed(6)} \\text{ m}`,
      result: `y_CG = ${y_CG.toFixed(6)} m`,
    });

    const y_CP = y_CG + (Ix * sinTheta ** 2) / (y_CG * A);

    steps.push({
      label: "Centro de Pressão",
      type: "substitution",
      formula: `y_{CP} = y_{CG} + \\frac{I_{x} \\cdot \\sin^2\\theta}{y_{CG} \\cdot A}`,
      substitution: `y_{CP} = ${y_CG.toFixed(6)} + \\frac{${Ix.toExponential(4)} \\times \\sin^2(${theta}°)}{${y_CG.toFixed(6)} \\times ${A.toFixed(6)}} = ${y_CP.toFixed(6)} \\text{ m}`,
      result: `y_CP = ${y_CP.toFixed(6)} m`,
    });

    const h_CP = y_CP * sinTheta;

    steps.push({
      label: "Profundidade do Centro de Pressão",
      type: "substitution",
      formula: `h_{CP} = y_{CP} \\cdot \\sin\\theta`,
      substitution: `h_{CP} = ${y_CP.toFixed(6)} \\times \\sin(${theta}°) = ${h_CP.toFixed(6)} \\text{ m}`,
      result: `h_CP = ${h_CP.toFixed(6)} m`,
    });

    steps.push({
      label: "Resultado Final",
      type: "result",
      result: `F = ${F.toFixed(4)} N | h_CP = ${h_CP.toFixed(6)} m`,
    });

    setResult({ forca: F, yCP: h_CP, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout
      title="Força em Superfícies Submersas Planas (Comportas)"
      metaDescription="Calcule a força hidrostática resultante e o centro de pressão em superfícies submersas planas. Memorial de cálculo passo a passo."
    >
      <div className="mb-4">
        <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">
          Geometria da Superfície
        </label>
        <select
          value={geometria}
          onChange={(e) => {
            setGeometria(e.target.value as Geometria);
            setResult(null);
          }}
          className="border border-input bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none"
        >
          <option value="retangulo">Retângulo</option>
          <option value="circulo">Círculo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {geometria === "retangulo" && (
          <>
            <InputField
              label="Base (b)"
              unit="m"
              value={base}
              onChange={(v) => { setBase(v); clearError("base"); }}
              error={errors.base}
              unitGroup="length"
              onUnitFactorChange={(f) => setFactor("base", f)}
            />
            <InputField
              label="Altura da superfície (h)"
              unit="m"
              value={alturaGeom}
              onChange={(v) => { setAlturaGeom(v); clearError("alturaGeom"); }}
              error={errors.alturaGeom}
              unitGroup="length"
              onUnitFactorChange={(f) => setFactor("alturaGeom", f)}
            />
          </>
        )}
        {geometria === "circulo" && (
          <InputField
            label="Raio (r)"
            unit="m"
            value={raio}
            onChange={(v) => { setRaio(v); clearError("raio"); }}
            error={errors.raio}
            unitGroup="length"
            onUnitFactorChange={(f) => setFactor("raio", f)}
          />
        )}
        <InputField
          label="Profundidade do Centroide (h_CG)"
          unit="m"
          value={hCG}
          onChange={(v) => { setHCG(v); clearError("hCG"); }}
          error={errors.hCG}
          unitGroup="length"
          onUnitFactorChange={(f) => setFactor("hCG", f)}
        />
        <InputField
          label="Densidade do Fluido (ρ)"
          unit="kg/m³"
          value={rhoFluido}
          onChange={(v) => { setRhoFluido(v); clearError("rhoFluido"); }}
          error={errors.rhoFluido}
          unitGroup="density"
          onUnitFactorChange={(f) => setFactor("rhoFluido", f)}
        />
        <InputField
          label="Ângulo de inclinação (θ)"
          unit="°"
          value={angulo}
          onChange={(v) => { setAngulo(v); clearError("angulo"); }}
          error={errors.angulo}
        />
      </div>

      <button
        onClick={calculate}
        className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8"
      >
        Calcular
      </button>

      {result && (
        <div key={result.forca}>
          <ResultBox label="Força Resultante" value={`${result.forca.toFixed(4)} N`} />
          <ResultBox label="Profundidade do Centro de Pressão" value={`${result.yCP.toFixed(6)} m`} />
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4"
          >
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">
          Força Hidrostática em Superfícies Planas
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A força de pressão hidrostática sobre uma superfície submersa plana é calculada pela fórmula F = ρ·g·h_CG·A,
          onde h_CG é a profundidade vertical do centroide da superfície. O centro de pressão (h_CP) é o ponto
          onde a força resultante é efetivamente aplicada — sempre abaixo do centroide.
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Esta análise é fundamental para o projeto de comportas, barragens, tanques pressurizados e qualquer
          estrutura submetida a cargas hidrostáticas distribuídas. O ângulo de inclinação (θ) permite considerar
          superfícies inclinadas em relação à superfície livre.
        </p>
      </div>
    </CalculatorLayout>
  );
}
