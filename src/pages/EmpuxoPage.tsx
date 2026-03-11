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

  // Dimensions for shapes
  const [raio, setRaio] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");

  const [result, setResult] = useState<{
    empuxo: number;
    peso: number;
    laudo: string;
    volSubmerso: number;
    steps: any[];
  } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const calculate = () => {
    const m = parseFloat(massa);
    const rhoF = parseFloat(rhoFluido);
    if (isNaN(m) || isNaN(rhoF) || rhoF === 0) return;

    const steps: any[] = [];
    let vol: number;

    switch (shape) {
      case "cilindro": {
        const r = parseFloat(raio);
        const h = parseFloat(altura);
        if (isNaN(r) || isNaN(h)) return;
        vol = Math.PI * r ** 2 * h;
        steps.push({
          label: "Volume do Cilindro",
          formula: "V = π × r² × h",
          result: `V = π × ${r}² × ${h} = ${vol.toFixed(6)} m³`,
        });
        break;
      }
      case "esfera": {
        const r = parseFloat(raio);
        if (isNaN(r)) return;
        vol = (4 / 3) * Math.PI * r ** 3;
        steps.push({
          label: "Volume da Esfera",
          formula: "V = (4/3) × π × r³",
          result: `V = (4/3) × π × ${r}³ = ${vol.toFixed(6)} m³`,
        });
        break;
      }
      case "paralelepipedo": {
        const c = parseFloat(comprimento);
        const l = parseFloat(largura);
        const h = parseFloat(altura);
        if (isNaN(c) || isNaN(l) || isNaN(h)) return;
        vol = c * l * h;
        steps.push({
          label: "Volume do Paralelepípedo",
          formula: "V = C × L × H",
          result: `V = ${c} × ${l} × ${h} = ${vol.toFixed(6)} m³`,
        });
        break;
      }
      default: {
        vol = parseFloat(volume);
        if (isNaN(vol)) return;
        steps.push({ label: "Volume informado", result: `V = ${vol} m³` });
      }
    }

    const peso = m * g;
    const rhoObj = m / vol;

    // If fully submerged
    const empuxoMax = rhoF * vol * g;

    let laudo: string;
    let volSubmerso: number;

    if (rhoObj < rhoF) {
      // Floats: E = peso, Vsub = m / rhoF
      volSubmerso = m / rhoF;
      laudo = "O objeto vai BOIAR 🟢";
    } else if (rhoObj === rhoF) {
      volSubmerso = vol;
      laudo = "Equilíbrio Neutro 🟡";
    } else {
      volSubmerso = vol;
      laudo = "O objeto vai AFUNDAR 🔴";
    }

    const empuxo = rhoF * volSubmerso * g;

    steps.push({
      label: "Peso do Objeto",
      formula: "W = m × g",
      result: `W = ${m} × ${g} = ${peso.toFixed(4)} N`,
    });

    steps.push({
      label: "Densidade do Objeto",
      formula: "ρ_obj = m / V",
      result: `ρ_obj = ${m} / ${vol.toFixed(6)} = ${rhoObj.toFixed(2)} kg/m³`,
    });

    steps.push({
      label: "Comparação de Densidades",
      result: `ρ_obj (${rhoObj.toFixed(2)}) ${rhoObj < rhoF ? "<" : rhoObj === rhoF ? "=" : ">"} ρ_fluido (${rhoF})`,
    });

    steps.push({
      label: "Volume Submerso",
      formula: rhoObj < rhoF ? "V_sub = m / ρ_fluido" : "V_sub = V (totalmente submerso)",
      result: `V_sub = ${volSubmerso.toFixed(6)} m³`,
    });

    steps.push({
      label: "Força de Empuxo",
      formula: "E = ρ_fluido × V_sub × g",
      result: `E = ${rhoF} × ${volSubmerso.toFixed(6)} × ${g} = ${empuxo.toFixed(4)} N`,
    });

    steps.push({
      label: "Laudo Final",
      result: laudo,
    });

    setResult({ empuxo, peso, laudo, volSubmerso, steps });
    setShowSteps(false);
  };

  return (
    <CalculatorLayout title="Força de Empuxo — Arquimedes">
      <div className="mb-4">
        <label className="text-xs font-heading text-foreground uppercase tracking-wider block mb-1">
          Formato do Objeto
        </label>
        <select
          value={shape}
          onChange={(e) => { setShape(e.target.value as Shape); setResult(null); }}
          className="border border-foreground bg-background px-3 py-2 text-sm font-heading text-foreground focus:border-primary focus:outline-none"
        >
          <option value="custom">Volume direto</option>
          <option value="cilindro">Cilindro</option>
          <option value="esfera">Esfera</option>
          <option value="paralelepipedo">Paralelepípedo</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {shape === "custom" && (
          <InputField label="Volume" unit="m³" value={volume} onChange={setVolume} />
        )}
        {(shape === "cilindro" || shape === "esfera") && (
          <InputField label="Raio" unit="m" value={raio} onChange={setRaio} />
        )}
        {(shape === "cilindro" || shape === "paralelepipedo") && (
          <InputField label="Altura" unit="m" value={altura} onChange={setAltura} />
        )}
        {shape === "paralelepipedo" && (
          <>
            <InputField label="Comprimento" unit="m" value={comprimento} onChange={setComprimento} />
            <InputField label="Largura" unit="m" value={largura} onChange={setLargura} />
          </>
        )}
        <InputField label="Massa do Objeto" unit="kg" value={massa} onChange={setMassa} />
        <InputField label="Densidade do Fluido" unit="kg/m³" value={rhoFluido} onChange={setRhoFluido} />
      </div>

      <button
        onClick={calculate}
        className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8"
      >
        Calcular
      </button>

      {result && (
        <div key={result.empuxo}>
          <ResultBox
            label="Força de Empuxo"
            value={`${result.empuxo.toFixed(4)} N`}
            classification={result.laudo}
          />
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="border border-foreground bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4"
          >
            {showSteps ? "Ocultar" : "Mostrar"} Memorial de Cálculo
          </button>
          {showSteps && <StepByStep steps={result.steps} />}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8 space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">
          O Princípio de Arquimedes e a Força de Flutuação (Empuxo)
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A força de empuxo é o fenômeno hidrostático que dita a estabilidade e a flutuação de corpos imersos em fluidos. Pelo Princípio de Arquimedes, qualquer objeto parcial ou totalmente submerso experimenta uma força vertical ascendente, cuja magnitude é exatamente igual ao peso do volume do fluido que foi deslocado pelo corpo.
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          A análise de flutuabilidade exige o cruzamento direto de densidades. Se a densidade média do objeto for superior à densidade do fluido, a força peso supera o empuxo máximo possível, resultando no afundamento. Caso a densidade do corpo seja inferior à do líquido, ocorre a flutuação, e o sistema encontra equilíbrio quando a fração do volume submerso desloca a exata quantidade de fluido necessária para igualar a força peso total do corpo. Esse cálculo é a base da engenharia naval, dimensionamento de balsas, boias de nível e hidrômetros.
        </p>
      </div>
    </CalculatorLayout>
  );
}
