import React, { JSX } from "react";

interface ButtonProps {
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  onSubmit?: () => void;
  className: string;
}

const Button: React.FC<ButtonProps> = ({
  onSubmit,
  children,
  type,
  className,
}) => {
  return (
    <button
      onSubmit={onSubmit}
      type={type}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
