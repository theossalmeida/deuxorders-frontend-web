"use client";

import { useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_REFERENCES = 3;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function ReferenceUploader({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls]);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const remaining = MAX_REFERENCES - files.length;
    if (remaining <= 0) return;
    const added = Array.from(incoming).slice(0, remaining);
    onChange([...files, ...added]);
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border"
          >
            <Image
              src={previewUrls[i]}
              alt={file.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-destructive opacity-0 transition group-hover:opacity-100"
              aria-label="Remover imagem"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {files.length < MAX_REFERENCES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border",
              "text-muted-foreground transition hover:border-foreground/30 hover:text-foreground",
            )}
          >
            <ImagePlus size={18} />
            <span className="text-[10px]">
              {files.length}/{MAX_REFERENCES}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
