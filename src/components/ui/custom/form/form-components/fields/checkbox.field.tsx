import { useFieldContext } from "../../form-context";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";
import { type ComponentProps } from "react";

type CheckboxFieldProps = {
  label: string;
  description?: string;
} & Omit<
  ComponentProps<typeof Checkbox>,
  "checked" | "onCheckedChange" | "id" | "onBlur"
>;

const CheckboxField = ({
  label,
  description,
  ...props
}: CheckboxFieldProps) => {
  const field = useFieldContext<boolean>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field
      orientation="horizontal"
      data-invalid={isInvalid}
      className="items-start"
    >
      <Checkbox
        id={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
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
export default CheckboxField;
