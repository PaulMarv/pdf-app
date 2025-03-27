"use client";

import { useEffect, useRef, useState } from "react";

interface AnnotationLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedTool: string;
  selectedColor: string;
  signature?: string | null;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ canvasRef, selectedTool, selectedColor, signature }) => {
  const annotationRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (annotationRef.current) {
      const ctx = annotationRef.current.getContext("2d");
      if (ctx) {
        setContext(ctx);
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedTool === "highlight" ? 10 : 2;
        ctx.globalAlpha = selectedTool === "highlight" ? 0.3 : 1;
      }
    }
  }, [selectedColor, selectedTool]);

  useEffect(() => {
    if (canvasRef.current && annotationRef.current) {
      annotationRef.current.width = canvasRef.current.width;
      annotationRef.current.height = canvasRef.current.height;
    }
  }, [canvasRef]);

  useEffect(() => {
    if (signature && annotationRef.current) {
      const img = new Image();
      img.src = signature;
      img.onload = () => {
        const ctx = annotationRef.current?.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 50, 50, 100, 50); // Position and size of signature
        }
      };
    }
  }, [signature]);

  return <canvas ref={annotationRef} className="absolute top-0 left-0 w-full h-full pointer-events-auto"></canvas>;
};

export default AnnotationLayer;
