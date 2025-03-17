import React, { JSX } from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onSubmit?: () => void;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onSubmit,
  children,
  type,
  className,
  onClick,
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
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
