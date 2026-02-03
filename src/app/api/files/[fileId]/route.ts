import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import mime from "mime";
import { prisma } from "@repo/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  try {
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await readFile(fileRecord.path);
    const mimeType =
      fileRecord.mimeType ||
      mime.getType(fileRecord.path) ||
      "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
