// ColorPicker.tsx
"use client";

import { useState } from "react";
import { SketchPicker } from "react-color";

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        className="w-8 h-8 rounded-full border-2 border-gray-300"
        style={{ backgroundColor: selectedColor }}
        onClick={() => setShowPicker(!showPicker)}
      />
      {showPicker && (
        <div className="absolute top-10 left-0 z-30 shadow-lg ">
          <SketchPicker
            color={selectedColor}
            onChange={(color) => onSelectColor(color.hex)}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
