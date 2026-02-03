import { createFormHookContexts } from "@tanstack/react-form";

// יצירת Context עבור השדות והטופס
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
