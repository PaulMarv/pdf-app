'use client';
import { useState } from "react";
import Button from "@/components/Button";
import { Pencil, Highlighter, Underline, Signature } from "lucide-react";

type Tool = "highlight" | "underline" | "comment" | "signature";

type ToolbarProps = {
  onSelectTool: (tool: Tool) => void;
};

export default function Toolbar({ onSelectTool }: ToolbarProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    onSelectTool(tool);
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-100 shadow-md rounded-md">
      <Button
        variant={selectedTool === "highlight" ? "default" : "outline"}
        onClick={() => handleToolSelect("highlight")}
      >
        <Highlighter className="w-5 h-5" />
      </Button>
      <Button
        variant={selectedTool === "underline" ? "default" : "outline"}
        onClick={() => handleToolSelect("underline")}
      >
        <Underline className="w-5 h-5" />
      </Button>
      <Button
        variant={selectedTool === "comment" ? "default" : "outline"}
        onClick={() => handleToolSelect("comment")}
      >
        <Pencil className="w-5 h-5" />
      </Button>
      <Button
        variant={selectedTool === "signature" ? "default" : "outline"}
        onClick={() => handleToolSelect("signature")}
      >
        <Signature className="w-5 h-5" />
      </Button>
    </div>
  );
}
