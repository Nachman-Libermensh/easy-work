"use server";

export async function getYoutubeTitle(url: string): Promise<string | null> {
  try {
    // Basic validation
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      return null;
    }

    // Using oEmbed API of YouTube to fetch video details in JSON format
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      url,
    )}&format=json`;

    const res = await fetch(oembedUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EasyWork/1.0)",
      },
      next: { revalidate: 3600 }, // Cache results for 1 hour
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.title || null;
  } catch (error) {
    console.error("Error fetching YouTube title:", error);
    return null;
  }
}
