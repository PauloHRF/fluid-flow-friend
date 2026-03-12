import { useRef, useCallback } from "react";

interface ExportPDFProps {
  contentRef: React.RefObject<HTMLDivElement>;
  filename?: string;
}

export function ExportPDF({ contentRef, filename = "memorial-de-calculo" }: ExportPDFProps) {
  const handleExport = useCallback(async () => {
    if (!contentRef.current) return;
    const { default: html2canvas } = await import("html2canvas-pro");
    const { default: jsPDF } = await import("jspdf");

    const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: "#f5f5f5" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  }, [contentRef, filename]);

  return (
    <button
      onClick={handleExport}
      className="border border-input bg-background text-foreground font-heading text-sm uppercase tracking-wider px-6 py-2 cursor-pointer mb-4 ml-2"
    >
      Exportar PDF
    </button>
  );
}
