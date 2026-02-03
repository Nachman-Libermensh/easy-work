import { useFieldContext } from "../../form-context";
import { FileInput } from "@/src/components/ui/custom/inputs/file-input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";
import { useEffect, useState } from "react";

interface FileInputFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
  // If true, the raw File object is stored in state. If false/undefined, base64 (legacy)
  storeFileObject?: boolean;
}

export default function FileInputField({
  label,
  description,
  placeholder,
}: FileInputFieldProps) {
  const field = useFieldContext<any>(); // any to support File | string
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  const currentValue = field.state.value;

  // State only used for File objects to hold the generated blob URL
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentValue instanceof File) {
      const url = URL.createObjectURL(currentValue);
      setTimeout(() => {
        setBlobUrl(url);
      }, 0);
      return () => {
        URL.revokeObjectURL(url);
        // We don't clear state here to avoid null flash before unmount/change,
        // the cleanup is mainly for browser memory.
      };
    } else {
      // If value is not a file (e.g. null or string url), ensure we don't hold a stale blob url
      setTimeout(() => {
        setBlobUrl(null);
      }, 0);
    }
  }, [currentValue]);

  // Derived state: Use blobUrl if it's a File, otherwise use the string value (URL) directly
  const previewUrl =
    currentValue instanceof File
      ? blobUrl
      : typeof currentValue === "string"
      ? currentValue
      : null;

  const handleFileChange = (file: File | null) => {
    if (!file) {
      field.handleChange(null);
      return;
    }

    // We store the File object directly so we can send it via FormData
    field.handleChange(file);
  };

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <FileInput
        id={field.name}
        value={previewUrl}
        onChange={handleFileChange}
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
