"use server";

export async function getYoutubeTitle(url: string): Promise<string | null> {
  try {
    // Basic validation
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      return null;
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url,
    )}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error("Failed to fetch YouTube title", error);
    return null;
  }
}
