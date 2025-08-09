import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "outline",
  children,
  className = "",
  ...props
}) => {
  const baseClass = "btn";
  const variantClass = variant === "primary" ? "btn-primary" : "btn-outline";

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
