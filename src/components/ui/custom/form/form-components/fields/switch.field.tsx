import { useFieldContext } from "../../form-context";
import { Switch } from "@/src/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";
import { ComponentProps } from "react";

type SwitchFieldProps = {
  label: string;
  description?: string;
} & Omit<
  ComponentProps<typeof Switch>,
  | "label"
  | "checked"
  | "onCheckedChange"
  | "id"
  | "onBlur"
  | "error"
  | "helperText"
>;

const SwitchField = ({ label, description, ...props }: SwitchFieldProps) => {
  const field = useFieldContext<boolean>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field
      orientation="horizontal"
      data-invalid={isInvalid}
      className="items-start"
    >
      <Switch
        id={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError
          errors={field.state.meta.isTouched ? field.state.meta.errors : []}
        />
      </FieldContent>
    </Field>
  );
};

export default SwitchField;
