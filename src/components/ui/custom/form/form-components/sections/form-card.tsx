// import React from "react";
// import { Text, Badge, cn } from "rizzui";

// type FormCardProps = {
//   /** כותרת הכרטיסייה */
//   title?: string;
//   /** תיאור הכרטיסייה */
//   description?: string;
//   /** תגית לכרטיסייה */
//   badge?: string;
//   /** צבע התגית */
//   badgeColor?:
//     | "primary"
//     | "secondary"
//     | "danger"
//     | "warning"
//     | "success"
//     | "info";
//   /** מחלקות CSS מותאמות */
//   className?: string;
//   /** תוכן הכרטיסייה */
//   children: React.ReactNode;
// };

// export default function FormCard({
//   title,
//   description,
//   badge,
//   badgeColor = "primary",
//   className,
//   children,
// }: FormCardProps) {
//   return (
//     <div
//       className={cn(
//         "rounded-lg border border-gray-200 overflow-hidden",
//         className
//       )}
//     >
//       {(title || description) && (
//         <div className="p-4 bg-gray-50 border-b">
//           <div className="flex justify-between items-center">
//             <div>
//               {title && <Text className="font-medium">{title}</Text>}
//               {description && (
//                 <Text className="text-sm text-gray-500 mt-0.5">
//                   {description}
//                 </Text>
//               )}
//             </div>
//             {badge && (
//               <Badge variant="flat" color={badgeColor}>
//                 {badge}
//               </Badge>
//             )}
//           </div>
//         </div>
//       )}
//       <div className="p-4">{children}</div>
//     </div>
//   );
// }
