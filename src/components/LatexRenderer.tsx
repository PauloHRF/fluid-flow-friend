import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface LatexRendererProps {
  math: string;
  display?: boolean;
  className?: string;
}

export function LatexRenderer({ math, display = false, className = "" }: LatexRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return math;
    }
  }, [math, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
