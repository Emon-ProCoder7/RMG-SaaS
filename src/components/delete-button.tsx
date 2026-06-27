"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  id: string;
  label: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  variant?: "icon" | "text";
};

export function DeleteButton({ id, label, action, variant = "icon" }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await action(id);
      if (!res.ok) {
        toast.error(res.error ?? "Could not delete");
        return;
      }
      toast.success("Deleted successfully");
      router.refresh();
    });
  };

  if (variant === "text") {
    return (
      <Button variant="ghost" size="sm" className="h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs" onClick={handleDelete} disabled={pending}>
        <Trash2 className="h-3 w-3 mr-1" />
        Delete
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={handleDelete} disabled={pending}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
