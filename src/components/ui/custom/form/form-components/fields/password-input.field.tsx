import { useFieldContext } from "../../form-context";
import { PasswordInput } from "@/src/components/ui/custom/inputs/password-input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";

interface PasswordInputFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
}

export default function PasswordInputField({
  label,
  description,
  placeholder,
}: PasswordInputFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <PasswordInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldContent>
        <FieldError
          errors={field.state.meta.isTouched ? field.state.meta.errors : []}
        />
      </FieldContent>
    </Field>
  );
}
