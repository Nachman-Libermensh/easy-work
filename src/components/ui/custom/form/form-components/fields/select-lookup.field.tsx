import { useFieldContext } from "../../form-context";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";
import { SelectLookup } from "@/src/lib/lookups/select-lookup";
import { LookupKey } from "@/src/lib/lookups";

type SelectLookupFieldProps = {
  label: string;
  lookup: LookupKey;
  placeholder?: string;
  description?: string;
};

const SelectLookupField = ({
  label,
  lookup,
  placeholder,
  description,
}: SelectLookupFieldProps) => {
  const field = useFieldContext<string | number | null>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  // Convert field value to string for Select component, handle null properly
  const selectValue =
    field.state.value != null ? String(field.state.value) : undefined;

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <SelectLookup
        lookup={lookup}
        value={selectValue}
        onValueChange={(value) => {
          // Convert back to number if it's a numeric value
          const numValue = Number(value);
          const finalValue =
            !isNaN(numValue) && value !== "" ? numValue : value;
          field.handleChange(finalValue);
        }}
        placeholder={placeholder}
        error={isInvalid}
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

export default SelectLookupField;
