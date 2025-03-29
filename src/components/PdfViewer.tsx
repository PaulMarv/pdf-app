"use client";

import { useEffect, useRef, useState } from "react";
import AnnotationLayer from "@/components/AnnotationLayer";
import SignaturePad from "@/components/SignaturePad";
import { usePdf } from "@/hooks/usePdf";
import { renderPage, exportPdfWithAnnotations, renderTextLayer } from "@/utils/pdfUtils";
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

  const canvasRefs = useRef<Array<React.RefObject<HTMLCanvasElement>>>([]);
  const annotationRefs = useRef<Array<React.RefObject<HTMLCanvasElement>>>([]);
  const textLayerRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);


  useEffect(() => {
    if (file) {
      file.arrayBuffer()
        .then((buffer) => setPdfBytes(new Uint8Array(buffer)))
        .catch((err) => console.error("Error loading PDF file:", err));
    }
  }, [file, setPdfBytes]);

  useEffect(() => {
    if (numPages > 0 && canvasRefs.current.length === 0) {
      canvasRefs.current = Array.from({ length: numPages }, () => React.createRef<HTMLCanvasElement>() as React.RefObject<HTMLCanvasElement>);
      annotationRefs.current = Array.from({ length: numPages }, () => React.createRef<HTMLCanvasElement>() as React.RefObject<HTMLCanvasElement>);

    }
  }, [numPages]);

  useEffect(() => {
    if (!pdfDoc) return;

    const render = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const canvas = canvasRefs.current[pageNum - 1]?.current;
        const textLayer = textLayerRefs.current[pageNum - 1]?.current;
        if (canvas) {
          await renderPage(pdfDoc, pageNum, canvas);
        }
        if (textLayer) {
          await renderTextLayer(pdfDoc, pageNum, textLayer);
        }
      }
    };

    render();
  }, [pdfDoc, numPages]);

  const handleExport = async () => {
    if (!pdfBytes || typeof document === "undefined") return;
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
        <div key={index} className="relative mb-4 w-full">

          <div ref={textLayerRefs.current[index]} className="absolute top-0 left-0 w-full h-full"></div>
          <canvas ref={canvasRefs.current[index]} className="w-full border" />

          <AnnotationLayer
            canvasRef={annotationRefs.current[index]}
            textLayerRef={textLayerRefs.current[index]}
            selectedTool={selectedTool}
            selectedColor={selectedColor}
            signature={signature}
            pageNumber={index + 1}
            pdfBytes={pdfBytes}
            onUpdatePdf={setPdfBytes}
            onCommentAdded={() => { }}
          />
        </div>
      ))}

      <div className="fixed bottom-5 right-5 flex gap-4">
        <SignaturePad onSave={setSignature} selectedColor={selectedColor} />
        <Button onClick={handleExport}>Export PDF</Button>
      </div>
    </div>
  );
};

export default PDFViewer;
