import React, { JSX } from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onSubmit?: () => void;
  className: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  onSubmit,
  children,
  type,
  className,
  onClick,
}) => {
  return (
    <button
      onSubmit={onSubmit}
      type={type}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
