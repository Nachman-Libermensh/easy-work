"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/components/ui/input-group";

export function EmailInput({
  className,
  value,
  onChange,
  defaultValue,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  // Handle both controlled and uncontrolled states
  const [internalValue, setInternalValue] = React.useState(
    defaultValue?.toString() ?? ""
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value?.toString() ?? "" : internalValue;
  const showSuggestion = currentValue.endsWith("@");

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSuggestion = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent accidental form submission

    const newValue = currentValue + "gmail.com";

    // If uncontrolled, we update our local state
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Notify parent via standard onChange handler
    if (onChange) {
      // Create a compatible change event object
      // This is the "React way": pass data up, let parent drive state down
      const simulatedEvent = {
        ...e,
        target: {
          ...inputRef.current,
          value: newValue,
          name: props.name,
        },
        currentTarget: {
          ...inputRef.current,
          value: newValue,
          name: props.name,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(simulatedEvent);
    }

    // Return focus to input for continued typing
    inputRef.current?.focus();
  };

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <Mail />
      </InputGroupAddon>
      <InputGroupInput
        {...props}
        ref={inputRef}
        type="email"
        value={currentValue}
        onChange={(e) => {
          if (!isControlled) {
            setInternalValue(e.target.value);
          }
          onChange?.(e);
        }}
      />
      {showSuggestion && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleSuggestion} type="button">
            gmail.com
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
