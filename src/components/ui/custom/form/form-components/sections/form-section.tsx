// "use client";

// import React from "react";
// import { Accordion, Text, cn } from "rizzui";
// import { MdExpandMore } from "react-icons/md";

// type FormSectionProps = {
//   /** כותרת המקטע */
//   title: string;
//   /** תיאור / הסבר למקטע (אופציונלי) */
//   description?: string;
//   /** האם המקטע ניתן לקיפול */
//   collapsible?: boolean;
//   /** האם המקטע מקופל כברירת מחדל */
//   defaultCollapsed?: boolean;
//   /** מחלקות CSS מותאמות */
//   className?: string;
//   /** תוכן המקטע */
//   children: React.ReactNode;
// };

// export default function FormSection({
//   title,
//   description,
//   collapsible = false,
//   defaultCollapsed = false,
//   className,
//   children,
// }: FormSectionProps) {
//   // אם המקטע לא ניתן לקיפול, פשוט נציג אותו כרגיל
//   if (!collapsible) {
//     return (
//       <div
//         className={cn(
//           "mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm",
//           className
//         )}
//       >
//         <div className="mb-4">
//           <Text className="text-lg font-medium text-gray-900">{title}</Text>
//           {description && (
//             <Text className="mt-1 text-sm text-gray-500">{description}</Text>
//           )}
//         </div>
//         <div className="space-y-4">{children}</div>
//       </div>
//     );
//   }

//   // אם המקטע ניתן לקיפול, נשתמש בקומפוננטת האקורדיון
//   return (
//     <Accordion
//       defaultOpen={!defaultCollapsed}
//       className={cn(
//         "mb-8 rounded-lg border border-gray-200 bg-white overflow-hidden",
//         className
//       )}
//     >
//       <Accordion.Header>
//         {({ open }) => (
//           <div className="flex w-full cursor-pointer items-center justify-between px-5 py-4">
//             <div>
//               <Text className="text-lg font-medium text-gray-900">{title}</Text>
//               {description && (
//                 <Text className="mt-1 text-sm text-gray-500">
//                   {description}
//                 </Text>
//               )}
//             </div>
//             <MdExpandMore
//               className={cn(
//                 "h-5 w-5 text-gray-500 transform transition-transform duration-300",
//                 open ? "rotate-180" : "rotate-0"
//               )}
//             />
//           </div>
//         )}
//       </Accordion.Header>
//       <Accordion.Body className="px-5 pb-5">
//         <div className="space-y-4">{children}</div>
//       </Accordion.Body>
//     </Accordion>
//   );
// }
