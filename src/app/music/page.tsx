"use client";

import { useState } from "react";
import { useAppStore } from "@/src/store/app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Separator } from "@/src/components/ui/separator";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Trash2,
  Plus,
  Music,
  Play,
  Pause,
  ListMusic,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

export default function MusicPage() {
  const {
    playlist,
    addToPlaylist,
    removeFromPlaylist,
    playMusic,
    pauseMusic,
    isMusicPlaying,
    currentTrackIndex,
    setCurrentTrackIndex,
    musicMode,
    setMusicMode,
  } = useAppStore();
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = async () => {
    if (!newUrl) return;
    try {
      // Simple validation
      new URL(newUrl);

      const finalTitle = newTitle.trim() || `Track ${playlist.length + 1}`;

      // הוספה ל-store ללא ניסיון אוטומטי כושל
      await addToPlaylist(newUrl, finalTitle);

      setNewUrl("");
      setNewTitle("");
      toast.success("השיר נוסף לרשימה", {
        description: finalTitle,
      });
    } catch {
      toast.error("כתובת לא תקינה");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          מוזיקה ופלייליסטים
        </h1>
        <p className="text-muted-foreground">
          ניהול רשימת ההשמעה, הוספת שירים מיוטיוב והגדרות ניגון.
        </p>
      </div>

      <Separator />

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Left Column: Playlist (Takes up more space) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <Card className="h-full border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ListMusic className="h-5 w-5" /> רשימת השמעה
                  </CardTitle>
                  <CardDescription>
                    {playlist.length} שירים ברשימה
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-b-lg m-4 border border-dashed">
                  <Music className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">הרשימה ריקה</p>
                  <p className="text-sm">הוסיפו שירים כדי להתחיל לנגן</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] w-full pr-4">
                  <div className="divide-y">
                    {playlist.map((track, index) => {
                      const isCurrent = index === currentTrackIndex;
                      const isPlaying = isCurrent && isMusicPlaying;

                      return (
                        <div
                          key={track.id}
                          className={cn(
                            "group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                            isCurrent && "bg-muted/30",
                          )}
                          onClick={() => {
                            setCurrentTrackIndex(index);
                            if (isPlaying) {
                              pauseMusic();
                            } else {
                              playMusic();
                            }
                          }}
                        >
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div
                              className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all",
                                isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:bg-primary/20",
                              )}
                            >
                              {isPlaying ? (
                                <div className="flex gap-[2px] items-end h-3">
                                  <span className="w-0.5 h-2 bg-current animate-[bounce_1s_infinite]" />
                                  <span className="w-0.5 h-3 bg-current animate-[bounce_1.2s_infinite] animation-delay-200" />
                                  <span className="w-0.5 h-1 bg-current animate-[bounce_0.8s_infinite] animation-delay-400" />
                                </div>
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "font-medium truncate",
                                  isCurrent && "text-primary",
                                )}
                              >
                                {track.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-xs block">
                                {track.url}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromPlaylist(track.id);
                              }}
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                              aria-label="הסר מהרשימה"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Controls & Add (Sticky on Desktop) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6 md:sticky md:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                הוספת תוכן
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">קישור YouTube</Label>
                <div className="relative">
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="pl-8"
                    dir="ltr"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">שם השיר (אופציונלי)</Label>
                <Input
                  id="title"
                  placeholder="שם מותאם אישית..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <Button className="w-full" onClick={handleAdd}>
                <Plus className="ml-2 h-4 w-4" /> הוסף לרשימה
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">מצב ניגון</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                dir="rtl"
                value={musicMode}
                onValueChange={(value) =>
                  setMusicMode(value as "playlist" | "single" | "loop-playlist")
                }
                className="flex flex-col gap-2"
              >
                <label
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent transition-all",
                    musicMode === "single" && "border-primary bg-accent/50",
                  )}
                >
                  <span className="text-sm font-medium">שיר בודד (לופ)</span>
                  <RadioGroupItem value="single" />
                </label>

                <label
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent transition-all",
                    musicMode === "playlist" && "border-primary bg-accent/50",
                  )}
                >
                  <span className="text-sm font-medium">רצף (פעם אחת)</span>
                  <RadioGroupItem value="playlist" />
                </label>

                <label
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent transition-all",
                    musicMode === "loop-playlist" &&
                      "border-primary bg-accent/50",
                  )}
                >
                  <span className="text-sm font-medium">פלייליסט (לופ)</span>
                  <RadioGroupItem value="loop-playlist" />
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
