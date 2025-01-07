import React from "react";
export interface ButtonProps {
  variant: "primary" | "secondary";
  size: "sm" | "md" | "lg";
  text: string;
  startIcon: any;
  endIcon: any;
  onClick: () => void;
}
export const Button = (props: ButtonProps) => {
  return <div>Button</div>;
};
