import { useFieldContext } from "../../form-context";
import { EmailInput } from "@/src/components/ui/custom/inputs/email-input";
import { Field, FieldError, FieldLabel } from "@/src/components/ui/field";
import { type ComponentProps } from "react";

type EmailInputFieldProps = {
  label: string;
} & Omit<ComponentProps<typeof EmailInput>, "value" | "onChange" | "onBlur">;

const EmailInputField = ({ label, ...props }: EmailInputFieldProps) => {
  const field = useFieldContext<string>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <EmailInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
      <FieldError
        errors={field.state.meta.isTouched ? field.state.meta.errors : []}
      />
    </Field>
  );
};
export default EmailInputField;
