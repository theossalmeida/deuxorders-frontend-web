import { AlertTriangle } from "lucide-react";
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DestructiveDialogHeader({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <AlertDialogHeader>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <AlertDialogTitle>{title}</AlertDialogTitle>
      </div>
      {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
    </AlertDialogHeader>
  );
}
