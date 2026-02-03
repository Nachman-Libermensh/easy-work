import { api, http, endpoints } from "./http";

export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string | null;
  size: number | null;
  path: string;
  extension: string | null;
  createdAt: string;
  url?: string;
}

export const uploadFile = (file: File): Promise<FileRecord> =>
  api.post<FileRecord>(endpoints.uploads, { file });

export const getUploadedFile = (id: string): Promise<Blob> =>
  http
    .get<Blob>(`${endpoints.uploads}/${id}`, undefined, {
      responseType: "blob",
    })
    .then((res) => res.data);
