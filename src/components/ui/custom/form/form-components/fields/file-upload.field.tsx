// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   FileUpload,
//   FileUploadDropzone,
//   FileUploadItem,
//   FileUploadItemDelete,
//   FileUploadItemMetadata,
//   FileUploadItemPreview,
//   FileUploadItemProgress,
//   FileUploadList,
//   FileUploadTrigger,
// } from "@/components/ui/file-upload";
// import { Upload, X } from "lucide-react";
// import * as React from "react";
// import { toast } from "sonner";
// import { useFieldContext } from "../../form-context";
// import { type FieldError } from "../../types";

// /**
//  * שדה העלאת קבצים לטפסים
//  * משתמש ב-useFieldContext להתחברות למערכת הטפסים
//  */
// type FileUploadFieldProps = {
//   /** כותרת השדה */
//   label?: string;
//   /** תיאור השדה */
//   description?: string;
//   /** סוגי קבצים מותרים */
//   accept?: string;
//   /** מספר קבצים מקסימלי */
//   maxFiles?: number;
//   /** גודל קובץ מקסימלי בבייטים */
//   maxSize?: number;
//   /** האם לאפשר מספר קבצים */
//   multiple?: boolean;
//   /** טקסט לכפתור העלאה */
//   browseText?: string;
//   /** טקסט ראשי באזור הגרירה */
//   dropzoneTitle?: string;
//   /** טקסט משני באזור הגרירה */
//   dropzoneDescription?: string;
//   /** className נוסף לקומפוננטה */
//   className?: string;
//   /** סוג תצוגת הרשימה */
//   listOrientation?: "horizontal" | "vertical";
//   /** האם להציג progress בצורה מעגלית */
//   showProgress?: boolean;
//   /** גודל התצוגה המקדימה */
//   previewSize?: "sm" | "md" | "lg";
//   /** פונקציה להעלאה */
//   onUpload?: (
//     files: File[],
//     options: {
//       onProgress: (file: File, progress: number) => void;
//       onSuccess: (file: File) => void;
//       onError: (file: File, error: Error) => void;
//     },
//   ) => Promise<void> | void;
// };

// const FileUploadField = ({
//   label,
//   description,
//   accept,
//   maxFiles = 5,
//   maxSize = 5 * 1024 * 1024, // 5MB default
//   multiple = false,
//   browseText = "Browse files",
//   dropzoneTitle = "Drag & drop files here",
//   dropzoneDescription,
//   className,
//   listOrientation = "vertical",
//   showProgress = false,
//   previewSize = "md",
//   onUpload,
// }: FileUploadFieldProps) => {
//   // התחברות להקשר השדה
//   const field = useFieldContext<File | File[] | null>();

//   // קבלת הערך הנוכחי מהשדה
//   const currentValue = field.state.value;
//   const files = React.useMemo(() => {
//     if (!currentValue) return [];
//     return Array.isArray(currentValue) ? currentValue : [currentValue];
//   }, [currentValue]);

//   // טיפול בשינוי קבצים
//   const handleFileChange = React.useCallback(
//     (newFiles: File[]) => {
//       if (multiple) {
//         field.handleChange(newFiles);
//       } else {
//         field.handleChange(newFiles.length > 0 ? newFiles[0] : null);
//       }
//     },
//     [field, multiple],
//   );

//   // טיפול בדחיית קבצים
//   const onFileReject = React.useCallback((file: File, message: string) => {
//     const fileName =
//       file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
//     toast.error(message, {
//       description: `"${fileName}" has been rejected`,
//     });
//   }, []);

//   // יצירת תיאור דינמי
//   const dynamicDescription = React.useMemo(() => {
//     if (dropzoneDescription) return dropzoneDescription;

//     const parts = [];
//     if (maxFiles > 1) {
//       parts.push(`max ${maxFiles} files`);
//     }
//     if (maxSize) {
//       const sizeMB = Math.round(maxSize / (1024 * 1024));
//       parts.push(`up to ${sizeMB}MB each`);
//     }

//     return parts.length > 0
//       ? `Or click to browse (${parts.join(", ")})`
//       : "Or click to browse";
//   }, [dropzoneDescription, maxFiles, maxSize]);

//   // ניהול הודעות שגיאה
//   const errorMessage = React.useMemo(() => {
//     if (field.state.meta.isTouched && field.state.meta.errors.length > 0) {
//       return field.state.meta.errors
//         .map((error: FieldError) => error.message)
//         .join(", ");
//     }
//     return undefined;
//   }, [field.state.meta.isTouched, field.state.meta.errors]);

//   // הגדרת גדלים לתצוגה מקדימה
//   const previewSizeClasses = {
//     sm: "size-12 [&>svg]:size-6",
//     md: "size-20 [&>svg]:size-10",
//     lg: "size-24 [&>svg]:size-12",
//   };

//   return (
//     <div className="space-y-2">
//       {label && (
//         <label
//           className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//           htmlFor={field.name}
//         >
//           {label}
//         </label>
//       )}

//       <FileUpload
//         maxFiles={maxFiles}
//         maxSize={maxSize}
//         className={className}
//         value={files}
//         onValueChange={handleFileChange}
//         onFileReject={onFileReject}
//         onUpload={onUpload}
//         accept={accept}
//         multiple={multiple}
//         invalid={!!errorMessage}
//       >
//         <FileUploadDropzone>
//           <div className="flex flex-col items-center gap-1 text-center">
//             <div className="flex items-center justify-center rounded-full border p-2.5">
//               <Upload className="text-muted-foreground size-6" />
//             </div>
//             <p className="text-sm font-medium">{dropzoneTitle}</p>
//             <p className="text-muted-foreground text-xs">
//               {dynamicDescription}
//             </p>
//           </div>
//           <FileUploadTrigger asChild>
//             <Button variant="outline" size="sm" className="mt-2 w-fit">
//               {browseText}
//             </Button>
//           </FileUploadTrigger>
//         </FileUploadDropzone>

//         <FileUploadList orientation={listOrientation}>
//           {files.map((file, index) => (
//             <FileUploadItem
//               key={`${file.name}-${index}`}
//               value={file}
//               className={listOrientation === "horizontal" ? "p-0" : undefined}
//             >
//               <FileUploadItemPreview
//                 className={
//                   listOrientation === "horizontal"
//                     ? previewSizeClasses[previewSize]
//                     : undefined
//                 }
//               >
//                 {showProgress && (
//                   <FileUploadItemProgress
//                     variant={
//                       listOrientation === "horizontal" ? "circular" : "linear"
//                     }
//                     size={
//                       previewSize === "sm" ? 30 : previewSize === "md" ? 40 : 50
//                     }
//                   />
//                 )}
//               </FileUploadItemPreview>

//               {listOrientation === "vertical" && <FileUploadItemMetadata />}
//               {listOrientation === "horizontal" && (
//                 <FileUploadItemMetadata className="sr-only" />
//               )}

//               <FileUploadItemDelete asChild>
//                 <Button
//                   variant={
//                     listOrientation === "horizontal" ? "secondary" : "ghost"
//                   }
//                   size="icon"
//                   className={
//                     listOrientation === "horizontal"
//                       ? "absolute -top-1 -right-1 size-5 rounded-full"
//                       : "size-7"
//                   }
//                 >
//                   <X
//                     className={
//                       listOrientation === "horizontal" ? "size-3" : "size-4"
//                     }
//                   />
//                 </Button>
//               </FileUploadItemDelete>
//             </FileUploadItem>
//           ))}
//         </FileUploadList>
//       </FileUpload>

//       {description && (
//         <p className="text-muted-foreground text-sm">{description}</p>
//       )}

//       {errorMessage && (
//         <p className="text-destructive text-sm">{errorMessage}</p>
//       )}
//     </div>
//   );
// };

// export default FileUploadField;
