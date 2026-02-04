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
import { Trash2, Plus, Music, Play, Pause } from "lucide-react";
import { toast } from "sonner";

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Music className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          מוזיקה מרגיעה לעבודה
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הוספת קישור יוטיוב</CardTitle>
          <CardDescription>
            הוסיפו שיר בודד, רשימה או וידאו מיוטיוב להשמעה רציפה
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] items-end">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="url">קישור YouTube</Label>
            <Input
              id="url"
              placeholder="https://youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">כותרת ידנית (אופציונלי)</Label>
            <Input
              id="title"
              placeholder="למשל: Lo-Fi Focus"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <Button className="mt-auto" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> הוספה
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>אופן ניגון</CardTitle>
          <CardDescription>
            בחרו האם לנגן שיר בודד, רצף חד-פעמי או לופ של כל הרשימה
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={musicMode}
            onValueChange={(value) =>
              setMusicMode(value as "playlist" | "single" | "sequence")
            }
            className="grid gap-3 sm:grid-cols-3"
          >
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value="single" />
              <span className="text-sm font-medium">שיר בודד בלופ</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value="sequence" />
              <span className="text-sm font-medium">רצף חד-פעמי</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <RadioGroupItem value="playlist" />
              <span className="text-sm font-medium">פלייליסט בלופ</span>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {playlist.map((track, index) => (
          <Card
            key={track.id}
            className={`transition-all ${
              index === currentTrackIndex && isMusicPlaying
                ? "border-primary ring-1 ring-primary"
                : ""
            }`}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-mono">
                  {index + 1}
                </div>
                <div className="truncate">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.url}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const isCurrent = index === currentTrackIndex;
                    setCurrentTrackIndex(index);
                    if (isMusicPlaying && isCurrent) {
                      pauseMusic();
                    } else {
                      playMusic();
                    }
                  }}
                  className="text-muted-foreground hover:text-primary"
                  aria-label="נגן או השהה"
                >
                  {isMusicPlaying && index === currentTrackIndex ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromPlaylist(track.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="הסר מהרשימה"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {playlist.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>עדיין אין שירים ברשימה.</p>
          </div>
        )}
      </div>
    </div>
  );
}
