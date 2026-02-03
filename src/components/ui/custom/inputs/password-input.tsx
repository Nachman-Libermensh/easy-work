"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/components/ui/input-group";

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type"
>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
      <InputGroup>
        {/* Right side (Start in RTL) - Password Icon */}
        <InputGroupAddon align="inline-start">
          <Lock />
        </InputGroupAddon>

        <InputGroupInput
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={className}
          {...props}
        />

        {/* Left side (End in RTL) - Toggle Button */}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={toggleVisibility}
            type="button"
            aria-label={isVisible ? "הסתר סיסמא" : "הצג סיסמא"}
          >
            {isVisible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
