"use client";

import { useEffect, useRef, useState, createRef } from "react";
import AnnotationLayer from "@/components/AnnotationLayer";
import SignaturePad from "@/components/SignaturePad";
import { usePdf } from "@/hooks/usePdf";
import { renderPage } from "@/utils/pdfUtils";

interface PDFViewerProps {
  file: File | null;
  selectedTool: string;
  selectedColor: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, selectedTool, selectedColor }) => {
  const { pdfDoc, numPages } = usePdf(file);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [annotationRefs, setAnnotationRefs] = useState<React.RefObject<HTMLCanvasElement | null>[]>([]);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    // Update annotationRefs whenever numPages changes
    setAnnotationRefs(
      Array.from({ length: numPages }, () => createRef<HTMLCanvasElement>())
    );
  }, [numPages]);

  useEffect(() => {
    if (!pdfDoc) return;
    const render = async () => {
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const canvas = canvasRefs.current[pageNum - 1];
        if (canvas) await renderPage(pdfDoc, pageNum, canvas);
      }
    };
    render();
  }, [pdfDoc, numPages]);

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
  };

  return (
    <div className="relative w-full">
      {Array.from({ length: numPages }).map((_, index) => (
        <div key={index} className="relative mb-4">
          <canvas
            ref={(el) => {
              canvasRefs.current[index] = el;
            }}
            className="w-full border"
          />
          {annotationRefs[index]?.current && (
            <AnnotationLayer
              canvasRef={annotationRefs[index] as React.RefObject<HTMLCanvasElement>}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              signature={signature}
            />
          )}
        </div>
      ))}

      {/* Signature Pad Component */}
      <div className="fixed bottom-5 right-5">
        <SignaturePad onSave={handleSignatureSave} />
      </div>
    </div>
  );
};

export default PDFViewer;