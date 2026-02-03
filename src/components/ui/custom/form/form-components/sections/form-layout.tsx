// "use client";

// import React from "react";
// import { Grid, cn } from "rizzui";

// type FormLayoutProps = {
//   /** תוכן הטופס */
//   children: React.ReactNode;
//   /** מחלקות CSS מותאמות */
//   className?: string;
//   /** כיוון הטקסט */
//   dir?: "rtl" | "ltr";
//   /** מרווח בין אלמנטים */
//   spacing?:
//     | "1"
//     | "2"
//     | "3"
//     | "4"
//     | "5"
//     | "6"
//     | "7"
//     | "8"
//     | "9"
//     | "10"
//     | "11"
//     | "12"
//     | undefined;
//   /** האם להציג במסגרת */
//   bordered?: boolean;
// };

// const FormLayout = ({
//   children,
//   className,
//   dir = "rtl",
//   spacing = "4",
//   bordered = false,
// }: FormLayoutProps) => {
//   return (
//     <Grid
//       gap={spacing}
//       dir={dir}
//       className={cn(
//         "w-full",
//         {
//           "p-5 border rounded-lg border-gray-200": bordered,
//         },
//         className
//       )}
//     >
//       {children}
//     </Grid>
//   );
// };

// export default FormLayout;
