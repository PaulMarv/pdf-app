import * as pdfjs from "pdfjs-dist";
import { PDFDocument, rgb, RGB } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"; // Correct import
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs"; // Required for rendering text layers
import "pdfjs-dist/web/pdf_viewer.css";
// Ensure the worker is set
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Load a PDF file into pdfjs-dist for rendering.
 */
export const loadPdf = async (file: File): Promise<pdfjs.PDFDocumentProxy | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log("Successfully loaded PDF:", pdfDoc);
    return pdfDoc;
  } catch (error) {
    console.error("Error loading PDF:", error);
    return null;
  }
};



// export const renderPage = async (
//   pdfDoc: pdfjs.PDFDocumentProxy | null,
//   pageNum: number,
//   canvas: HTMLCanvasElement
// ) => {
//   if (!pdfDoc) return;
//   const page = await pdfDoc.getPage(pageNum);
//   const viewport = page.getViewport({ scale: 1.5 });
//   const context = canvas.getContext("2d");

//   if (!context) return;
//   canvas.width = viewport.width;
//   canvas.height = viewport.height;

//   await page.render({ canvasContext: context, viewport }).promise;
// };

export async function renderPage(pdfDoc: pdfjs.PDFDocumentProxy | null, pageNum: number, canvas: HTMLCanvasElement) {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.5 });

  const context = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (context) {
    await page.render({ canvasContext: context, viewport }).promise;
  }
}

export async function renderTextLayer(
  pdfDoc: pdfjsLib.PDFDocumentProxy | null,
  pageNum: number,
  textLayerContainer: HTMLDivElement
) {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.5 });

  // Clear the container before rendering a new text layer
  textLayerContainer.innerHTML = "";

  // Create an instance of TextLayerBuilder
  const textLayerBuilder = new pdfjsViewer.TextLayerBuilder({
    pdfPage: page, // Required
  
  });

  // Append the text layer div to the container
  textLayerContainer.appendChild(textLayerBuilder.div);

  // Render the text layer
  await textLayerBuilder.render({
    viewport,
    textContentParams: {
      includeMarkedContent: true,
      disableNormalization: true,
    },
  });
}





export const highlightText = async (
  pdfBytes: Uint8Array,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color = rgb(1, 1, 0) // Default yellow highlight
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageNumber - 1);
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    opacity: 0.5,
  });
  return await pdfDoc.save();
};


/**
 * Underline text by drawing a line beneath it.
 */
export const underlineText = async (
  pdfBytes: Uint8Array,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  color = rgb(1, 0, 0) // Default red underline
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageNumber - 1);
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 2,
    color,
  });
  return await pdfDoc.save();
};

/**
 * Add a comment to the PDF by drawing a small icon or marker at a specific position.
 */
export const addCommentMarker = async (
  pdfBytes: Uint8Array,
  pageNumber: number,
  x: number,
  y: number,
  commentText: string
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageNumber - 1);

  // Draw a small rectangle as a marker
  page.drawRectangle({
    x,
    y,
    width: 10,
    height: 10,
    color: rgb(0, 0, 1), // Blue marker
  });

  // Store the comment somewhere (in a real app, you'd save it to a database)
  console.log(`Comment added on page ${pageNumber}: ${commentText}`);

  return await pdfDoc.save();
};

/**
 * Embed an image (signature) into the PDF.
 */
export const embedSignature = async (
  pdfBytes: Uint8Array,
  imageData: string,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const image = await pdfDoc.embedPng(imageData);
  const page = pdfDoc.getPage(pageNumber - 1);
  page.drawImage(image, { x, y, width, height });
  return await pdfDoc.save();
};

/**
 * Merge annotation images onto PDF pages and export the modified PDF.
 */
export const exportPdfWithAnnotations = async (
  pdfBytes: Uint8Array,
  annotationImages: { [pageNumber: number]: string }
) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  for (const [pageNumber, imageData] of Object.entries(annotationImages)) {
    const pageIndex = parseInt(pageNumber, 10) - 1;
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const image = await pdfDoc.embedPng(imageData);
      pages[pageIndex].drawImage(image, {
        x: 0,
        y: 0,
        width: pages[pageIndex].getWidth(),
        height: pages[pageIndex].getHeight(),
      });
    }
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes], { type: "application/pdf" });
};

export const annotatePdf = async ({
  pdfBytes,
  tool,
  pageNumber,
  x,
  y,
  width,
  height,
  color,
  signature,
  onCommentAdded,
}: {
  pdfBytes: Uint8Array;
  tool: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  signature: string | null;
  onCommentAdded: (page: number, x: number, y: number, text: string) => void;
}) => {
  let updatedPdfBytes: Uint8Array | null = null;
  const rgbColor = hexToRgb(color);

  if (tool === "highlight") {
    updatedPdfBytes = await highlightText(pdfBytes, pageNumber, x, y, width, height, rgbColor);
  } else if (tool === "underline") {
    updatedPdfBytes = await underlineText(pdfBytes, pageNumber, x, y, width, rgbColor);
  } else if (tool === "comment") {
    const commentText = prompt("Enter your comment:");
    if (commentText) {
      updatedPdfBytes = await addCommentMarker(pdfBytes, pageNumber, x, y, commentText);
      onCommentAdded(pageNumber, x, y, commentText);
    }
  } else if (tool === "signature" && signature) {
    updatedPdfBytes = await embedSignature(pdfBytes, signature, pageNumber, x, y, 100, 50);
  }

  return updatedPdfBytes || pdfBytes;
};

const hexToRgb = (hex: string): RGB => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }
  return rgb(r, g, b);
};
