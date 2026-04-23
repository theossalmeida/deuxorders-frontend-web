"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { buildRefSrc } from "@/lib/image-ref";
import { cn } from "@/lib/utils";

const MAX_REFERENCES = 3;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function EditReferenceManager({
  existingKeys,
  onRemoveExisting,
  newFiles,
  onNewFilesChange,
}: {
  existingKeys: string[];
  onRemoveExisting: (key: string) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existingKeys.length + newFiles.length;

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const remaining = MAX_REFERENCES - total;
    if (remaining <= 0) return;
    const added = Array.from(incoming).slice(0, remaining);
    onNewFilesChange([...newFiles, ...added]);
  }

  function removeNewFile(index: number) {
    onNewFilesChange(newFiles.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {existingKeys.map((key) => (
          <div
            key={key}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border"
          >
            <img
              src={buildRefSrc(key)}
              alt="Referência"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveExisting(key)}
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-destructive opacity-0 transition group-hover:opacity-100"
              aria-label="Remover referência"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {newFiles.map((file, i) => (
          <div
            key={`new-${file.name}-${i}`}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-dashed border-brand"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeNewFile(i)}
              className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-destructive opacity-0 transition group-hover:opacity-100"
              aria-label="Remover imagem"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {total < MAX_REFERENCES && (
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
              {total}/{MAX_REFERENCES}
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
