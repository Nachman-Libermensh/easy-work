// import { useFieldContext } from "../../form-context";
// import { MultiSelect, type Option } from "@/components/ui/select/select-multi";
// import { ComponentProps } from "react";

// type MultiSelectFieldProps = {
//   label: string;
//   options: Option[];
//   placeholder?: string;
//   description?: string;
// } & Omit<
//   ComponentProps<typeof MultiSelect>,
//   "label" | "value" | "onChange" | "options" | "error" | "helperText"
// >;

// const MultiSelectField = ({
//   label,
//   options,
//   placeholder,
//   description,
//   ...props
// }: MultiSelectFieldProps) => {
//   const field = useFieldContext<Option[]>();

//   const errorMessage =
//     field.state.meta.isTouched && field.state.meta.errors.length > 0
//       ? field.state.meta.errors.map((error) => error.message).join(", ")
//       : undefined;

//   return (
//     <MultiSelect
//       label={label}
//       helperText={description}
//       options={options}
//       placeholder={placeholder}
//       value={field.state.value || []}
//       onChange={(selectedOptions: Option[]) =>
//         field.handleChange(selectedOptions)
//       }
//       error={errorMessage}
//       {...props}
//     />
//   );
// };

// export default MultiSelectField;
