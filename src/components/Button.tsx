import React from "react";

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "danger";
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = "",
  disabled = false,
  variant = "default",
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none";
  const variantStyles = {
    default: "bg-blue-500 hover:bg-blue-600 text-white",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${
        disabled ? "bg-gray-400 cursor-not-allowed" : variantStyles[variant]
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
