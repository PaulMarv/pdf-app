import * as pdfjs from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
// import "@ungap/with-resolvers";
// await import("pdfjs-dist/build/pdf.worker.min.mjs");

GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.js";


/**
 * Loads a PDF file and returns the PDF document.
 */
export const loadPdf = async (file: File): Promise<pdfjs.PDFDocumentProxy> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      if (!reader.result) return reject("Failed to read file");
      const loadingTask = pdfjs.getDocument({ data: reader.result as ArrayBuffer });
      const pdf = await loadingTask.promise;
      resolve(pdf);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Renders a PDF page to a given canvas.
 */
export const renderPage = async (pdf: pdfjs.PDFDocumentProxy, pageNum: number, canvas: HTMLCanvasElement) => {
  const page = await pdf.getPage(pageNum);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) return;

  const renderContext = { canvasContext: context, viewport };
  await page.render(renderContext).promise;
};
