"use client";

import { useEffect, useRef, useState } from "react";
import { annotatePdf } from "@/utils/pdfUtils";

interface AnnotationLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  textLayerRef: React.RefObject<HTMLDivElement>;
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
  textLayerRef,
  selectedTool,
  selectedColor,
  signature,
  pageNumber,
  pdfBytes,
  onUpdatePdf,
  onCommentAdded
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  console.log(selectedTool);

  useEffect(() => {
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement!.clientWidth;
    canvas.height = canvas.parentElement!.clientHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctxRef.current = ctx;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;
    }
  }, [canvasRef, selectedColor]);

  const scaleCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfBytes) return;

    const { x, y } = scaleCoordinates(event);
    startX.current = x;
    startY.current = y;
    setIsDrawing(true);

    if (ctxRef.current) {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !ctxRef.current) return;

    const { x, y } = scaleCoordinates(event);

    if (selectedTool === "pen" || selectedTool === "highlight") {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    }
  };

  const handleMouseUp = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfBytes) return;

    if (selectedTool === "highlight" && textLayerRef?.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          console.log("Text selection detected", rect);


          const highlight = document.createElement("span");
          highlight.style.backgroundColor = selectedColor || "yellow";
          highlight.style.position = "absolute";
          highlight.style.left = `${rect.left}px`;
          highlight.style.top = `${rect.top}px`;
          highlight.style.width = `${rect.width}px`;
          highlight.style.height = `${rect.height}px`;
          highlight.style.opacity = "0.5";
          highlight.style.zIndex = "2";
          textLayerRef.current.appendChild(highlight);

          const updatedPdfBytes = await annotatePdf({
            pdfBytes,
            tool: "highlight",
            pageNumber,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            color: selectedColor,
            signature,
            onCommentAdded,
          });

          if (updatedPdfBytes) onUpdatePdf(updatedPdfBytes);
          selection.removeAllRanges(); 
          return;
        }
      }
    }

    if (isDrawing) {
      setIsDrawing(false);
      if (ctxRef.current) ctxRef.current.closePath();

      const { x, y } = scaleCoordinates(event);
      const updatedPdfBytes = await annotatePdf({
        pdfBytes,
        tool: selectedTool,
        pageNumber,
        x: startX.current,
        y: startY.current,
        width: x - startX.current,
        height: y - startY.current,
        color: selectedColor,
        signature,
        onCommentAdded,
      });

      if (updatedPdfBytes) onUpdatePdf(updatedPdfBytes);
    }
  };

  return (
    <div className="relative">
      <div ref={textLayerRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 mix-blend-normal!"
      ></div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-20"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default AnnotationLayer;
