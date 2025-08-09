import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  style,
}) => {
  return (
    <div className={`card p-4 space-y-3 ${className}`} style={style}>
      {children}
    </div>
  );
};
