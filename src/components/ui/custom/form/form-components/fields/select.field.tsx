import { useFieldContext } from "../../form-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
};

const SelectField = ({
  label,
  placeholder,
  description,
  options,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        dir="rtl"
        value={field.state.value || ""}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          className="cursor-pointer"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldContent>
        <FieldError
          errors={field.state.meta.isTouched ? field.state.meta.errors : []}
        />
      </FieldContent>
    </Field>
  );
};

export default SelectField;
