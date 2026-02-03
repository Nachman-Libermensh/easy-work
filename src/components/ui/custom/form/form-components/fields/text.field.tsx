import { Input } from "@/src/components/ui/input";
import { useFieldContext } from "../../form-context";
import { ComponentProps } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";

/**
 * שדה קלט טקסט/מספר לטפסים
 * משתמש ב-useFieldContext להתחברות למערכת הטפסים
 */
type TextFieldProps = {
  /** כותרת השדה */
  label: string;
  /** טקסט מקום שומר (placeholder) */
  placeholder?: string;
  /** תיאור/הסבר על השדה */
  description?: string;
} & Omit<
  ComponentProps<typeof Input>,
  "label" | "value" | "onChange" | "id" | "onBlur" | "error" | "helperText"
>;

const TextField = ({
  label,
  placeholder,
  description,
  ...props
}: TextFieldProps) => {
  const field = useFieldContext<string | number | null>();
  const isNumber = props.type === "number";

  // טיפול בשינוי ערך - מחזיר ערך מספרי או טקסטואלי בהתאם לסוג השדה
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumber) {
      // אם השדה ריק או הערך לא תקין - שומר null
      const valueAsNumber = e.target.valueAsNumber;
      field.handleChange(Number.isNaN(valueAsNumber) ? null : valueAsNumber);
    } else {
      field.handleChange(e.target.value);
    }
  };

  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  // טיפול בערך - ערך ריק מוצג כמחרוזת ריקה
  const displayValue = field.state.value ?? "";

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
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

export default TextField;
