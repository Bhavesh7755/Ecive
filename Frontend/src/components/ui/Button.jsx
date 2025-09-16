import React from "react";

export function Button({ children, variant = "solid", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-2xl px-4 py-2 focus:outline-none";
  const solid = "bg-green-600 text-white hover:bg-green-700";
  const outline = "border border-green-600 text-green-700 bg-transparent hover:bg-green-50";
  const cls = `${base} ${variant === "outline" ? outline : solid} ${className}`;
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}