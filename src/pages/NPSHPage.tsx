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

  const [result, setResult] = useState<{
    npshd: number;
    npshr: number | null;
    cavita: boolean | null;
    steps: any[];
  } | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const g = 9.81;

  const calculate = () => {
    const patm = parseFloat(Patm);
    const pvap = parseFloat(Pvapor);
    const hs = parseFloat(hSuccao);
    const hp = parseFloat(hPerdas);
    const vs = parseFloat(vSuccao);
    const density = parseFloat(rho);

    if ([patm, pvap, hs, hp, vs, density].some(isNaN) || density === 0) return;

    const npshr = parseFloat(NPSHr);
    const hasNPSHr = !isNaN(npshr) && npshr > 0;

    // NPSH_d = (Patm - Pvapor) / (ρg) - hs - hperdas + v²/(2g)
    // Some formulations omit velocity head; we include it
    const pressureHead = (patm - pvap) / (density * g);
    const velocityHead = vs ** 2 / (2 * g);
    const npshd = pressureHead - hs - hp + velocityHead;

    const steps: any[] = [
      {
        label: "Fórmula do NPSH Disponível",
        formula: "NPSHd = (Patm − Pvapor)/(ρg) − hs − hperdas + v²/(2g)",
        result: "Cálculo da energia líquida positiva de sucção disponível.",
      },
      {
        label: "Carga de Pressão",
        formula: "(Patm − Pvapor) / (ρ × g)",
        result: `(${patm} − ${pvap}) / (${density} × ${g}) = ${pressureHead.toFixed(4)} m`,
      },
      {
        label: "Altura de Sucção",
        result: `hs = ${hs} m`,
      },
      {
        label: "Perdas na Sucção",
        result: `hperdas = ${hp} m`,
      },
      {
        label: "Carga de Velocidade",
        formula: "v² / (2g)",
        result: `${vs}² / (2 × ${g}) = ${velocityHead.toFixed(4)} m`,
      },
      {
        label: "NPSH Disponível",
        formula: `${pressureHead.toFixed(4)} − ${hs} − ${hp} + ${velocityHead.toFixed(4)}`,
        result: `NPSHd = ${npshd.toFixed(4)} m`,
      },
    ];

    let cavita: boolean | null = null;

    if (hasNPSHr) {
      cavita = npshd < npshr;
      steps.push({
        label: "Comparação NPSHd vs NPSHr",
        result: `NPSHd (${npshd.toFixed(4)} m) ${cavita ? "<" : "≥"} NPSHr (${npshr} m)`,
      });
      steps.push({
        label: "⚠️ LAUDO FINAL",
        result: cavita
          ? "🔴 ALERTA: A bomba VAI CAVITAR! NPSHd < NPSHr. Risco de destruição da bomba!"
          : "🟢 SEGURO: NPSHd ≥ NPSHr. A bomba opera sem cavitação.",
      });
    }

    setResult({ npshd, npshr: hasNPSHr ? npshr : null, cavita, steps });
    setShowSteps(false);
  };

  const cavitaClass = result?.cavita === true;

  return (
    <CalculatorLayout title="NPSH e Cavitação — Sistema de Bombas">
      <p className="text-xs font-body text-muted-foreground mb-4">
        Informe o NPSH requerido (dado pelo fabricante da bomba) para obter o diagnóstico de cavitação.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Pressão Atmosférica" unit="Pa" value={Patm} onChange={setPatm} />
        <InputField label="Pressão de Vapor" unit="Pa" value={Pvapor} onChange={setPvapor} />
        <InputField label="Altura de Sucção (hs)" unit="m" value={hSuccao} onChange={setHSuccao} />
        <InputField label="Perdas na Sucção (hperdas)" unit="m" value={hPerdas} onChange={setHPerdas} />
        <InputField label="Velocidade na Sucção" unit="m/s" value={vSuccao} onChange={setVSuccao} />
        <InputField label="Densidade (ρ)" unit="kg/m³" value={rho} onChange={setRho} />
        <InputField label="NPSH Requerido (fabricante)" unit="m" value={NPSHr} onChange={setNPSHr} />
      </div>

      <button
        onClick={calculate}
        className="bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider px-8 py-3 border-none cursor-pointer mb-8"
      >
        Calcular
      </button>

      {result && (
        <div key={result.npshd}>
          <div className={cavitaClass ? "border-4 border-destructive p-2 mb-2 animate-pulse" : ""}>
            <ResultBox
              label="NPSH Disponível"
              value={`${result.npshd.toFixed(4)} m`}
              classification={
                result.cavita === true
                  ? "🔴 ALERTA: CAVITAÇÃO DETECTADA!"
                  : result.cavita === false
                  ? "🟢 Operação Segura"
                  : undefined
              }
            />
          </div>
          {result.npshr !== null && (
            <ResultBox label="NPSH Requerido" value={`${result.npshr} m`} />
          )}
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
          NPSH e a Prevenção do Fenômeno de Cavitação em Bombas Centrífugas
        </h2>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          O dimensionamento de um sistema de bombeamento vai muito além de vencer a elevação do terreno. O Net Positive Suction Head (NPSH), ou Carga Líquida Positiva de Sucção, é o principal parâmetro de segurança contra a cavitação. A cavitação ocorre quando a pressão absoluta na linha de sucção do fluido cai abaixo da sua pressão de vapor na temperatura de operação, causando a ebulição instantânea e a formação de microbolhas de vapor. Quando essas bolhas atingem a zona de alta pressão dentro do rotor da bomba, elas colapsam violentamente, arrancando material do impelidor e destruindo o equipamento.
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Para garantir a integridade mecânica da bomba centrífuga, o engenheiro deve garantir matematicamente que a energia disponível na sucção (NPSH Disponível, que depende do arranjo físico da instalação, perdas de carga, pressão atmosférica e pressão de vapor) seja estritamente maior que o NPSH Requerido, um valor tabelado e fornecido pelo fabricante da bomba com base em testes de bancada.
        </p>
      </div>
        <div key={result.npshd}>
          <div className={cavitaClass ? "border-4 border-destructive p-2 mb-2 animate-pulse" : ""}>
            <ResultBox
              label="NPSH Disponível"
              value={`${result.npshd.toFixed(4)} m`}
              classification={
                result.cavita === true
                  ? "🔴 ALERTA: CAVITAÇÃO DETECTADA!"
                  : result.cavita === false
                  ? "🟢 Operação Segura"
                  : undefined
              }
            />
      </div>
    </CalculatorLayout>
  );
}
