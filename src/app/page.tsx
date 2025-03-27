"use client";

import { useState } from "react";
import PDFViewer from "@/components/PdfViewer";
import Toolbar from "@/components/Toolbar";
import ColorPicker from "@/components/ColorPicker";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedTool, setSelectedTool] = useState<"highlight" | "underline" | "comment" | "signature">("highlight");
  const [selectedColor, setSelectedColor] = useState<string>("yellow");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* File Upload */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 border p-2" />

      {/* Toolbar */}
      <Toolbar onSelectTool={setSelectedTool} />

      {/* Color Picker (Only for Highlighting) */}
      {selectedTool === "highlight" && <ColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor} />}

      {/* PDF Viewer */}
      <div className="relative w-full max-w-4xl border rounded-lg shadow-lg">
        {file ? <PDFViewer file={file} selectedTool={selectedTool} selectedColor={selectedColor} /> : <p>Upload a PDF to get started</p>}
      </div>
    </div>
  );
}
