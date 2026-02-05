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
  Copy,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

export default function MusicPage() {
  const {
    playlist,
    addToPlaylist,
    removeFromPlaylist,
    updateTrack, // Ensure this action is added to your store
    playMusic,
    pauseMusic,
    isMusicPlaying,
    currentTrackIndex,
    setCurrentTrackIndex,
    musicMode,
    setMusicMode,
  } = useAppStore() as any;
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ title: "", url: "" });

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

  const startEditing = (track: any) => {
    setEditingId(track.id);
    setEditValues({ title: track.title, url: track.url });
  };

  const saveEdit = () => {
    if (editingId && updateTrack) {
      updateTrack(editingId, editValues.url, editValues.title);
      setEditingId(null);
      toast.success("פרטי השיר עודכנו");
    } else if (!updateTrack) {
      toast.error("עדכון לא נתמך כרגע");
      setEditingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 transition-colors duration-500">
          <div
            className={cn(
              "p-3 rounded-2xl transition-all duration-500 shadow-sm",
              isMusicPlaying
                ? "bg-primary/10 text-primary shadow-primary/20 ring-1 ring-primary/20"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Music
              className={cn(
                "h-8 w-8 transition-transform duration-700",
                isMusicPlaying && "animate-[pulse_3s_ease-in-out_infinite]",
              )}
            />
          </div>
          <span
            className={cn(
              "bg-clip-text text-transparent bg-gradient-to-l",
              isMusicPlaying
                ? "from-primary to-purple-600 font-extrabold"
                : "from-foreground to-foreground/70",
            )}
          >
            {isMusicPlaying ? "מנגן כעת..." : "מוזיקה ופלייליסטים"}
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          ניהול רשימת ההשמעה, הוספת שירים מיוטיוב והגדרות ניגון.
        </p>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="grid gap-8 md:grid-cols-12 items-start">
        {/* Left Column: Playlist (Takes up more space) */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <Card
            className={cn(
              "h-full border shadow-sm  pt-0  transition-all duration-500 overflow-hidden",
              isMusicPlaying
                ? "ring-2 ring-primary/10 shadow-lg border-primary/20"
                : "hover:shadow-md",
            )}
          >
            <CardHeader className="bg-muted/30 border-b px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle
                    className={cn(
                      "flex items-center gap-2 text-xl transition-all duration-300",
                      isMusicPlaying && "text-primary font-bold origin-right",
                    )}
                  >
                    {isMusicPlaying ? (
                      <Play className="h-5 w-5 fill-current animate-pulse" />
                    ) : (
                      <ListMusic className="h-5 w-5" />
                    )}
                    {isMusicPlaying ? "מתנגן כעת" : "רשימת השמעה"}
                  </CardTitle>
                  <CardDescription className="mt-1.5 flex items-center gap-2">
                    <span className="bg-background px-2 py-0.5 rounded-full border text-xs font-mono">
                      {playlist.length}
                    </span>
                    שירים ברשימה
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-background/50 backdrop-blur-sm">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/10 m-4 border-2 border-dashed rounded-xl gap-4">
                  <div className="p-4 bg-muted/50 rounded-full">
                    <Music className="h-12 w-12 opacity-40" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xl font-semibold text-foreground">
                      הרשימה ריקה
                    </p>
                    <p className="text-sm">הוסיפו שירים כדי להתחיל לנגן</p>
                  </div>
                </div>
              ) : (
                <ScrollArea dir="rtl" className="h-[600px] w-full">
                  <div className="divide-y divide-border/60">
                    {playlist.map((track: any, index: number) => {
                      const isCurrent = index === currentTrackIndex;
                      const isPlaying = isCurrent && isMusicPlaying;
                      const isEditing = editingId === track.id;

                      return (
                        <div
                          key={track.id}
                          className={cn(
                            "group flex items-center justify-between p-4  pl-3 transition-all duration-300 cursor-pointer relative",
                            isCurrent
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/40",
                          )}
                          onClick={() => {
                            if (!isEditing) {
                              setCurrentTrackIndex(index);
                              if (isPlaying) {
                                pauseMusic();
                              } else {
                                playMusic();
                              }
                            }
                          }}
                        >
                          {isCurrent && (
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                          )}

                          {isEditing ? (
                            <div
                              className="flex-1 flex gap-3 items-center pr-3 animate-in fade-in zoom-in-95"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col gap-2 flex-1">
                                <Input
                                  value={editValues.title}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  placeholder="שם השיר"
                                  className="h-9 font-medium"
                                  autoFocus
                                />
                                <Input
                                  value={editValues.url}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({
                                      ...prev,
                                      url: e.target.value,
                                    }))
                                  }
                                  placeholder="קישור"
                                  className="h-8 text-xs font-mono bg-muted/50 text-right ltr"
                                  dir="ltr"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={saveEdit}
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 hover:border-green-200 border border-transparent"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 hover:border-red-200 border border-transparent"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-4 overflow-hidden flex-1 pl-2">
                                <div
                                  className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 border shadow-sm",
                                    isCurrent
                                      ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md"
                                      : "bg-background text-muted-foreground border-border group-hover:border-primary/30 group-hover:text-primary",
                                  )}
                                >
                                  {isPlaying ? (
                                    <div className="flex gap-[2px] items-end h-3.5 mb-0.5">
                                      <span className="w-0.5 h-2.5 bg-current animate-[bounce_1s_infinite]" />
                                      <span className="w-0.5 h-4 bg-current animate-[bounce_1.2s_infinite] animation-delay-200" />
                                      <span className="w-0.5 h-2 bg-current animate-[bounce_0.8s_infinite] animation-delay-400" />
                                    </div>
                                  ) : (
                                    <span>{index + 1}</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 text-right space-y-0.5">
                                  <a
                                    href={track.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "block font-medium truncate text-base hover:underline transition-colors",
                                      isCurrent
                                        ? "text-primary font-bold"
                                        : "text-foreground/90 group-hover:text-primary",
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                    title="לחץ לפתיחה ב-YouTube"
                                  >
                                    {track.title}
                                  </a>
                                  <div className="flex items-center gap-2 group/url">
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-xs font-mono opacity-70 group-hover:opacity-100 transition-opacity">
                                      {track.url}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 opacity-0 group-hover/url:opacity-100 transition-all hover:bg-muted"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(
                                          track.url,
                                        );
                                        toast.success("הקישור הועתק");
                                      }}
                                      title="העתק קישור"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100 translate-x-2 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(track);
                                  }}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8 rounded-full"
                                  aria-label="ערוך"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromPlaylist(track.id);
                                  }}
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                                  aria-label="הסר מהרשימה"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
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
        <div className="md:col-span-5 lg:col-span-4 space-y-6 md:sticky md:top-8">
          <Card className="border pt-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/30 py-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg text-red-600 dark:text-red-500">
                  <Youtube className="h-5 w-5" />
                </div>
                הוספת תוכן
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="url">קישור YouTube</Label>
                <div className="relative">
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="pl-8 font-mono text-sm"
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
              <Button className="w-full mt-2" onClick={handleAdd}>
                <Plus className="ml-2 h-4 w-4" /> הוסף לרשימה
              </Button>
            </CardContent>
          </Card>

          <Card className="border pt-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/30 py-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                  <Play className="h-4 w-4" />
                </div>
                מצב ניגון
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RadioGroup
                dir="rtl"
                value={musicMode}
                onValueChange={(value) =>
                  setMusicMode(value as "playlist" | "single" | "loop-playlist")
                }
                className="flex flex-col gap-3"
              >
                {[
                  {
                    id: "single",
                    label: "שיר בודד (לופ)",
                    desc: "חזרה על השיר הנוכחי",
                  },
                  {
                    id: "playlist",
                    label: "רצף (פעם אחת)",
                    desc: "ניגון הרשימה ועצירה בסוף",
                  },
                  {
                    id: "loop-playlist",
                    label: "פלייליסט (לופ)",
                    desc: "חזרה על כל הרשימה",
                  },
                ].map((mode) => (
                  <label
                    key={mode.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-4 cursor-pointer hover:bg-accent transition-all relative overflow-hidden",
                      musicMode === mode.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent bg-muted/30 hover:bg-muted/50",
                    )}
                  >
                    {musicMode === mode.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div>
                      <div className="text-sm font-semibold">{mode.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {mode.desc}
                      </div>
                    </div>
                    <RadioGroupItem value={mode.id} />
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
