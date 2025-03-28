import { useState, useEffect } from "react";
import * as pdfjs from "pdfjs-dist";

// Manually set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export const usePdf = (file: File | null) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loaded, setLoaded] = useState(false);


  useEffect(() => {
    if (!file) {
      setPdfDoc(null);
      setNumPages(0);
      setPdfBytes(null);
      return;
    }

    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        setPdfBytes(data);

        const loadingTask = pdfjs.getDocument({ data });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoaded(true);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setPdfDoc(null);
        setNumPages(0);
        setPdfBytes(null);
      }
    };

    loadPdf();
  }, [file]);

  return { pdfDoc, numPages, pdfBytes, setPdfBytes, loaded };
  
};
