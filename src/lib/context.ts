import { supabase } from "@/integrations/supabase/client";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "text/plain": "TXT",
  "image/png": "PNG",
  "image/jpeg": "JPG",
};
export const ACCEPT = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg";

export type Resource = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  extracted_text_preview: string | null;
  stored_path: string;
  uploaded_at: string;
};

function guessMime(file: File) {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ({ pdf: "application/pdf", txt: "text/plain", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } as Record<string, string>)[ext ?? ""] ?? "";
}

// Text extraction runs in the browser; heavy parsers are loaded only when needed.
async function extractText(file: File, mime: string): Promise<string> {
  try {
    if (mime === "text/plain") return await file.text();
    if (mime === "application/pdf") {
      const pdfjs = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const content = await (await doc.getPage(i)).getTextContent();
        pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
      }
      return pages.join("\n\n");
    }
    if (mime.includes("wordprocessingml")) {
      const mammoth = await import("mammoth");
      return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
  } catch (e) {
    console.warn("Extraction failed", e);
  }
  return ""; // images and legacy .doc: stored, text not extracted
}

export const contextApi = {
  async get(projectId: string) {
    const [ctx, files] = await Promise.all([
      supabase.from("project_contexts").select("text").eq("project_id", projectId).maybeSingle(),
      supabase
        .from("project_resources")
        .select("id, filename, mime_type, size_bytes, extracted_text_preview, stored_path, uploaded_at")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: true }),
    ]);
    if (ctx.error) throw ctx.error;
    if (files.error) throw files.error;
    return { text: ctx.data?.text ?? "", files: files.data as Resource[] };
  },
  async saveText(projectId: string, text: string) {
    const { error } = await supabase.from("project_contexts").upsert({ project_id: projectId, text }, { onConflict: "project_id" });
    if (error) throw error;
  },
  validate(file: File): string | null {
    if (!ALLOWED_TYPES[guessMime(file)]) return `${file.name}: file type not supported`;
    if (file.size > MAX_FILE_BYTES) return `${file.name}: larger than 10 MB`;
    if (file.size === 0) return `${file.name}: file is empty`;
    return null;
  },
  async upload(projectId: string, userId: string, file: File) {
    const mime = guessMime(file);
    const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
    const path = `${userId}/${projectId}/${crypto.randomUUID()}_${safe}`;
    const up = await supabase.storage.from("project-files").upload(path, file, { contentType: mime });
    if (up.error) throw up.error;
    const text = (await extractText(file, mime)).replace(/\u0000/g, "").trim();
    const { error } = await supabase.from("project_resources").insert({
      project_id: projectId,
      filename: file.name.slice(0, 255),
      stored_path: path,
      mime_type: mime,
      size_bytes: file.size,
      extracted_text: text || null,
      extracted_text_preview: text ? text.slice(0, 500) : null,
    });
    if (error) {
      await supabase.storage.from("project-files").remove([path]);
      throw error;
    }
  },
  async remove(r: Resource) {
    const { error } = await supabase.from("project_resources").delete().eq("id", r.id);
    if (error) throw error;
    await supabase.storage.from("project-files").remove([r.stored_path]);
  },
};

export function formatBytes(n: number) {
  return n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}
