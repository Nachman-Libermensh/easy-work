import { createFormHook } from "@tanstack/react-form";
import { lazy } from "react";
import { fieldContext, formContext } from "./form-context";

/**
 * קומפוננטות מבנה טופס
 */
// const FormLayout = lazy(() => import("./form-components/sections/form-layout"));
// const FormSection = lazy(
//   () => import("./form-components/sections/form-section"),
// );
const FormActions = lazy(
  () => import("./form-components/sections/form-actions"),
);
const SubmitButton = lazy(
  () => import("./form-components/buttons/submit.button"),
);
const ResetButton = lazy(
  () => import("./form-components/buttons/reset.button"),
);
const DebugButton = lazy(
  () => import("./form-components/buttons/debug.button"),
);
/**
 * שדות קלט בסיסיים
 */
const TextField = lazy(() => import("./form-components/fields/text.field"));
const TextAreaField = lazy(
  () => import("./form-components/fields/text-area.field"),
);
const EmailInputField = lazy(
  () => import("./form-components/fields/email-input.field"),
);
const CheckboxField = lazy(
  () => import("./form-components/fields/checkbox.field"),
);

// const AdvancedCheckboxField = lazy(
//   () => import("./form-components/fields/advanced-checkbox.field"),
// );

const PasswordInputField = lazy(
  () => import("./form-components/fields/password-input.field"),
);
const FileInputField = lazy(
  () => import("./form-components/fields/file-input.field"),
);
const DatePickerField = lazy(
  () => import("./form-components/fields/date-picker.field"),
);

/**
 * שדות בחירה
 */
const SelectField = lazy(() => import("./form-components/fields/select.field"));
// const MultiSelectField = lazy(
//   () => import("./form-components/fields/multi-select.field"),
// );

// const SelectMultiLookupField = lazy(
//   () => import("./form-components/fields/select-multi-lookup.field")
// );
// const SelectUserField = lazy(
//   () => import("./form-components/fields/select-user.field")
// );

/**
 * שדות רדיו
 */
// const RadioGroupField = lazy(
//   () => import("./form-components/fields/radio-group.field"),
// );
// const AdvancedRadioGroupField = lazy(
//   () => import("./form-components/fields/advanced-radio-group.field"),
// );

const SwitchField = lazy(() => import("./form-components/fields/switch.field"));

/**
 * יצירת והגדרת ה-hook של הטופס
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext: formContext,

  formComponents: {
    SubmitButton,
    ResetButton,
    DebugButton,
  },

  fieldComponents: {
    TextField,
    TextAreaField,
    EmailInputField,
    CheckboxField,
    PasswordInputField,
    FileInputField, // Add this line
    SwitchField,
    SelectField,
    DatePickerField,
  },
});
