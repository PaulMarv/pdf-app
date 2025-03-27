'use client';
import { useEffect, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { loadPdf } from "@/utils/pdfUtils";

export const usePdf = (file: File | null) => {
    const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState<number>(0);

    useEffect(() => {
        if (!file) return;

        const fetchPdf = async () => {
            try {
                const pdf = await loadPdf(file);
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
            } catch (error) {
                console.error("Error loading PDF:", error);
            }
        };

        fetchPdf();
    }, [file]);

    return { pdfDoc, numPages };
};
