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
  } = useAppStore();
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    if (!newUrl) return;
    try {
      // Simple validation or just add
      new URL(newUrl);
      addToPlaylist(newUrl);
      setNewUrl("");
      toast.success("Track added to playlist");
    } catch {
      toast.error("Invalid URL");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Music className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Music Playlist</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Track</CardTitle>
          <CardDescription>
            Enter a YouTube URL to add to your relaxation playlist
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              placeholder="https://youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button className="mt-auto" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {playlist.map((track, index) => (
          <Card
            key={track.id}
            className={`transition-all ${index === currentTrackIndex && isMusicPlaying ? "border-primary ring-1 ring-primary" : ""}`}
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
                  onClick={() => removeFromPlaylist(track.id)}
                  className="text-muted-foreground hover:text-destructive"
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
            <p>No tracks in playlist yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
