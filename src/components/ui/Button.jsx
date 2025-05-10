import React from "react";

export function Button({
  children,
  className = "",
  disabled = false,
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 
      disabled:pointer-events-none disabled:opacity-50 
      bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 
      h-10 px-4 py-2 text-sm ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
