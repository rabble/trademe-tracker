import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "text-gray-700 hover:bg-gray-100",
      link: "text-indigo-600 underline-offset-4 hover:underline",
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-sm",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
