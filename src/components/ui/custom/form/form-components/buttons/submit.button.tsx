import { useStore } from "@tanstack/react-form";

import { useFormContext } from "../../form-context";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
type SubmitButtonProps = {
  lable?: string;
  className?: string;
} & React.ComponentProps<typeof Button>;

const SubmitButton = ({ className, lable, ...props }: SubmitButtonProps) => {
  const form = useFormContext();

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ]);

  return (
    <Button
      type="submit"
      className={cn("w-full", className)}
      disabled={isSubmitting || !canSubmit}
      isLoading={isSubmitting}
      {...props}
    >
      {lable ?? "שלח"}
    </Button>
  );
};
export default SubmitButton;
