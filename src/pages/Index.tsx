import { Link } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Atelier Mecânica dos Fluidos — Calculadoras com Passo a Passo";
  }, []);

  const tools = [
    { name: "Número de Reynolds", path: "/reynolds", desc: "Regime de escoamento e transição." },
    { name: "Eq. de Bernoulli", path: "/bernoulli", desc: "Cálculo de pressões e velocidades." },
    { name: "Perda de Carga", path: "/darcy-weisbach", desc: "Fator de atrito e tubulações." },
    { name: "Continuidade", path: "/continuidade", desc: "Vazão volumétrica e conservação de massa." },
    { name: "Manometria", path: "/manometria", desc: "Tubos em U e Lei de Stevin." },
    { name: "Empuxo (Arquimedes)", path: "/empuxo", desc: "Flutuação e volume submerso." },
    { name: "NPSH e Cavitação", path: "/npsh", desc: "Diagnóstico completo de bombas." },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 flex-1">
      <div className="max-w-4xl w-full">
        <h1 className="mb-2 text-3xl md:text-4xl font-heading font-bold text-foreground uppercase tracking-tight">
          Arsenal de Mecânica dos Fluidos
        </h1>
        <p className="mb-8 text-base md:text-lg text-muted-foreground font-body">
          Calculadoras passo a passo para esmagar as provas de Fenômenos de Transporte.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path} className="block group">
              <div className="border border-foreground p-6 h-full transition-all hover:bg-foreground hover:text-background cursor-pointer">
                <h2 className="text-xl font-heading uppercase font-bold mb-2 group-hover:text-background">{tool.name}</h2>
                <p className="text-sm font-body text-muted-foreground group-hover:text-background">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
