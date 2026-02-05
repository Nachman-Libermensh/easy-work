"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command";
import { useAppStore } from "@/src/store/app-store";
import { Music2, Plus } from "lucide-react";
import { toast } from "sonner";

export function MusicCommandDialog() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const { playlist, playMusic, setCurrentTrackIndex, addToPlaylist } =
    useAppStore();

  // מונע שגיאות Hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!mounted) return null;

  const handleSelect = (index: number) => {
    setCurrentTrackIndex(index);
    playMusic();
    setOpen(false);
    toast.success("מתחיל לנגן...");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes("youtube.com") || text.includes("youtu.be")) {
        addToPlaylist(text);
        toast.success("שיר נוסף לפלייליסט");
      } else {
        toast.error("לא נמצא קישור תקין בלוח");
      }
    } catch (e) {
      toast.error("שגיאה בקריאה מהלוח");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="חפש שיר בפלייליסט או לחץ Ctrl+V להוספה..." />
      <CommandList>
        <CommandEmpty>לא נמצאו שירים. נסה להדביק קישור מיוטיוב.</CommandEmpty>
        <CommandGroup heading="פעולות מהירות">
          <CommandItem onSelect={handlePaste}>
            <Plus className="mr-2 h-4 w-4" />
            הוסף שיר מהלוח (Youtube)
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="פלייליסט נוכחי">
          {playlist.map((track, index) => (
            <CommandItem
              key={track.id}
              onSelect={() => handleSelect(index)}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center">
                <Music2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{track.title || "טוען כותרת..."}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
