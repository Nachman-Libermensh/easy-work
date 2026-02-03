import { Textarea } from "@/src/components/ui/textarea";
import { useFieldContext } from "../../form-context";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";
import { ComponentProps } from "react";

type TextAreaFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
} & Omit<
  ComponentProps<typeof Textarea>,
  "label" | "value" | "onChange" | "id" | "onBlur" | "error" | "helperText"
>;

const TextAreaField = ({
  label,
  placeholder,
  description,
  ...props
}: TextAreaFieldProps) => {
  const field = useFieldContext<string>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        placeholder={placeholder}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldContent>
        <FieldError
          errors={field.state.meta.isTouched ? field.state.meta.errors : []}
        />
      </FieldContent>
    </Field>
  );
};

export default TextAreaField;
