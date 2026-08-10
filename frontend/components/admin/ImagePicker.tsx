"use client";

import { useRef, useState } from "react";

import { imageSrc, uploadImage } from "@/lib/admin";

import { Btn } from "./AdminShell";

/**
 * 圖片選擇器：可貼上現有 URL、或上傳新檔。
 * 上傳成功後直接呼叫 onChange 把新 URL 寫回父表單。
 */
export function ImagePicker({
  value,
  onChange,
  aspect = "aspect-square",
  className = "",
}: {
  value: string | null | undefined;
  onChange: (url: string) => void;
  aspect?: string;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setUploading(true);
    try {
      const data = await uploadImage(file);
      onChange(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "上傳失敗");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const src = imageSrc(value);

  return (
    <div className={className}>
      <div
        className={`${aspect} relative overflow-hidden rounded-2xl border-2 border-dashed border-cream-300 bg-cream-100`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-ink-soft">
            尚未選擇圖片
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPick}
          className="hidden"
        />
        <Btn
          type="button"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "上傳中…" : value ? "換一張" : "上傳圖片"}
        </Btn>
        {value && (
          <Btn type="button" variant="danger" onClick={() => onChange("")}>
            清除
          </Btn>
        )}
      </div>

      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/2026/05/xxx.jpg"
        className="mt-2 block w-full rounded-lg border-2 border-cream-200 bg-white px-2 py-1 font-mono text-xs text-ink-soft focus:border-coral-400 focus:outline-none"
      />

      {err && <p className="mt-2 text-xs font-bold text-coral-700">{err}</p>}
    </div>
  );
}
