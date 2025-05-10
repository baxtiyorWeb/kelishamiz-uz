import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
