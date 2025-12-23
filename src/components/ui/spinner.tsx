"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-r-transparent",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border",
        sm: "h-4 w-4 border",
        default: "h-6 w-6 border-2",
        md: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-[3px]",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        default: "border-foreground/20 border-r-transparent",
        primary: "border-primary/20 border-r-primary",
        secondary: "border-secondary/20 border-r-secondary", 
        muted: "border-muted-foreground/20 border-r-muted-foreground",
        accent: "border-accent/20 border-r-accent",
        destructive: "border-destructive/20 border-r-destructive",
        inverse: "border-background/30 border-r-background",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Screen reader label for the spinner
   */
  label?: string;
}

export function Spinner({
  className,
  size,
  variant,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Centered spinner with optional text
 */
export interface CenteredSpinnerProps extends SpinnerProps {
  text?: string;
  textClassName?: string;
}

export function CenteredSpinner({
  text,
  textClassName,
  className,
  ...props
}: CenteredSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Spinner {...props} />
      {text && (
        <p className={cn("text-sm text-muted-foreground", textClassName)}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Inline spinner for buttons and small spaces
 */
export interface InlineSpinnerProps extends SpinnerProps {
  text?: string;
}

export function InlineSpinner({ text, className, ...props }: InlineSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size="sm" {...props} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

/**
 * Page-level loading spinner
 */
export interface PageSpinnerProps extends Omit<CenteredSpinnerProps, "size"> {
  fullHeight?: boolean;
}

export function PageSpinner({
  fullHeight = true,
  text = "Loading...",
  className,
  ...props
}: PageSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full",
        fullHeight ? "min-h-[50vh]" : "py-12",
        className
      )}
    >
      <CenteredSpinner size="lg" text={text} {...props} />
    </div>
  );
}