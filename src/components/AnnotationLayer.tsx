"use client";

import { useEffect, useRef, useState } from "react";
import { annotatePdf } from "@/utils/pdfUtils"; // Centralized annotation handling

interface AnnotationLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedTool: string;
  selectedColor: string;
  signature: string | null;
  pageNumber: number;
  pdfBytes: Uint8Array | null;
  onUpdatePdf: (updatedPdfBytes: Uint8Array) => void;
  onCommentAdded: (page: number, x: number, y: number, text: string) => void;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  canvasRef,
  selectedTool,
  selectedColor,
  signature,
  pageNumber,
  pdfBytes,
  onUpdatePdf,
  onCommentAdded,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  console.log("pdfBytes in AnnotationLayer:", pdfBytes?.length);

  useEffect(() => {
    if (!canvasRef?.current) {
      console.warn(`Canvas ref is undefined for page ${pageNumber}`);
    }
  }, [canvasRef, pageNumber]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfBytes) return;
    const rect = canvasRef.current.getBoundingClientRect();
    startX.current = event.clientX - rect.left;
    startY.current = event.clientY - rect.top;
    setIsDrawing(true);
  };

  const handleMouseUp = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfBytes || !isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = event.clientX - rect.left;
    const endY = event.clientY - rect.top;

    const updatedPdfBytes = await annotatePdf({
      pdfBytes,
      tool: selectedTool,
      pageNumber,
      x: startX.current,
      y: startY.current,
      width: endX - startX.current,
      height: endY - startY.current,
      color: selectedColor,
      signature,
      onCommentAdded,
    });

    if (updatedPdfBytes) onUpdatePdf(updatedPdfBytes);
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-10"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

export default AnnotationLayer;
