"use client";

import { useEffect, useRef, useState } from "react";
import AnnotationLayer from "@/components/AnnotationLayer";
import SignaturePad from "@/components/SignaturePad";
import { usePdf } from "@/hooks/usePdf";
import { renderPage, exportPdfWithAnnotations } from "@/utils/pdfUtils";
import Button from "@/components/Button";
import React from "react";

interface PDFViewerProps {
  file: File | null;
  selectedTool: string;
  selectedColor: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, selectedTool, selectedColor }) => {
  const { pdfDoc, numPages, pdfBytes, setPdfBytes } = usePdf(file);
  const [signature, setSignature] = useState<string | null>(null);

  const canvasRefs = useRef<Array<React.RefObject<HTMLCanvasElement | null>>>([]);
  const annotationRefs = useRef<Array<React.RefObject<HTMLCanvasElement | null>>>([]);
  

  useEffect(() => {
    if (file) {
      file.arrayBuffer()
        .then((buffer) => setPdfBytes(new Uint8Array(buffer)))
        .catch((err) => console.error("Error loading PDF file:", err));
    }
  }, [file, setPdfBytes]);

  useEffect(() => {
    if (numPages > 0 && canvasRefs.current.length === 0) {
      for (let i = 0; i < numPages; i++) {
        canvasRefs.current.push(React.createRef<HTMLCanvasElement | null>());
        annotationRefs.current.push(React.createRef<HTMLCanvasElement | null>());
      }
    }
  }, [numPages]);

  useEffect(() => {
    if (!pdfDoc) return;
    
    const render = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const canvas = canvasRefs.current[pageNum - 1]?.current;
        if (!canvas) {
          console.warn(`Canvas ref is undefined for page ${pageNum}`);
          continue;
        }
        await renderPage(pdfDoc, pageNum, canvas);
      }
    };
    
    render();
  }, [pdfDoc, numPages]);

  const handleExport = async () => {
    if (!pdfBytes) return;
    const annotatedPdf = await exportPdfWithAnnotations(pdfBytes, {});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(annotatedPdf);
    link.download = "annotated.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full">
      {Array.from({ length: numPages }).map((_, index) => (
        <div key={index} className="relative mb-4">
          <canvas ref={canvasRefs.current[index]} className="w-full border" />
          <AnnotationLayer
            canvasRef={annotationRefs.current[index]}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            signature={signature}
            pageNumber={index + 1}
            pdfBytes={pdfBytes}
            onUpdatePdf={setPdfBytes}
            onCommentAdded={() => {}}
          />
        </div>
      ))}
      <div className="fixed bottom-5 right-5 flex gap-4">
        <SignaturePad onSave={setSignature} />
        <Button onClick={handleExport}>Export PDF</Button>
      </div>
    </div>
  );
};

export default PDFViewer;
