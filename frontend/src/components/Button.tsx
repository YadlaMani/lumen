import { log } from "console";
import React, { ReactElement } from "react";
type Variants = "primary" | "secondary";
export interface ButtonProps {
  variant: Variants;
  size: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick: () => void;
}
const variantStyles = {
  primary: "bg-purple-600 text-white",
  secondary: "bg-purple-200 text-purple-600",
};

const defaultStyles = "rounded-md p-4 flex";
const sizeStyles = {
  sm: "px-2 py-1",
  md: "py-2 px-4",
  lg: "py-4 px-6",
};
export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`${defaultStyles} ${variantStyles[props.variant]} ${
        sizeStyles[props.size]
      }`}
      onClick={props.onClick}
    >
      {props.startIcon ? <div className="pr-4">{props.startIcon}</div> : null}{" "}
      {props.text}{" "}
      {props.endIcon ? <div className="pl-4">{props.endIcon}</div> : null}
    </button>
  );
};
