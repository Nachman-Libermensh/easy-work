import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useFieldContext } from "../../form-context";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/components/ui/field";

type DatePickerFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
};

const DatePickerField = ({
  label,
  placeholder = "בחר תאריך",
  description,
  disabled,
}: DatePickerFieldProps) => {
  const field = useFieldContext<Date | undefined>();
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <Field orientation="vertical" data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-right font-normal",
              !field.state.value && "text-muted-foreground",
              isInvalid && "border-destructive text-destructive"
            )}
            disabled={disabled}
            id={field.name}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {field.state.value ? (
              format(new Date(field.state.value), "PPP", { locale: he })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={
              field.state.value ? new Date(field.state.value) : undefined
            }
            onSelect={(date) => field.handleChange(date)}
            initialFocus
            captionLayout="dropdown"
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldContent>
        <FieldError
          errors={field.state.meta.isTouched ? field.state.meta.errors : []}
        />
      </FieldContent>
    </Field>
  );
};

export default DatePickerField;
