import Image from "next/image";
import { cn } from "@/src/lib/utils";

interface LoadingWithImageProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function LoadingWithImage({
  className,
  size = 120,
  ...props
}: LoadingWithImageProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center ",
        className,
      )}
      {...props}
    >
      <div
        role="status"
        aria-label="טוען..."
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/*
          Using custom CSS borders instead of the generic Spinner component because:
          1. We need a background ring (track) which the icon lacks using pure CSS borders.
          2. We need explicit control over border thickness for this large size.
          3. We use a custom rainbow animation defined in globals.css.
        */}
        <div className="absolute inset-0 animate-spin-rainbow rounded-full border-[5px] border-transparent" />

        {/* Logo with Pulse Animation */}
        <div className="relative h-3/5 w-3/5 animate-pulse duration-1000">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
