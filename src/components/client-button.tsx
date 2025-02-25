"use client";

import { Button, ButtonProps } from "@/components/ui/button";

export function ClientButton({ children, ...props }: ButtonProps) {
  return <Button {...props}>{children}</Button>;
}
