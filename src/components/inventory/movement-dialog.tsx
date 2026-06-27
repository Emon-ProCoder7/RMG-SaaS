"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordMovement } from "@/lib/inventory/actions";
import type { ItemWithCategory, MovementType } from "@/lib/inventory/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MovementDialog({
  open,
  onOpenChange,
  items,
  defaultItemId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ItemWithCategory[];
  defaultItemId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [itemId, setItemId] = useState(defaultItemId ?? "");
  const [type, setType] = useState<MovementType>("in");

  useEffect(() => {
    if (open) setItemId(defaultItemId ?? "");
  }, [open, defaultItemId]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!itemId) {
      toast.error("Select an item");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("item_id", itemId);
    fd.set("type", type);
    startTransition(async () => {
      const res = await recordMovement(fd);
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      toast.success("Stock movement recorded");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record stock movement</DialogTitle>
          <DialogDescription>
            Stock-in adds, stock-out subtracts, adjust sets the exact quantity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <Select value={itemId} onValueChange={(v) => setItemId(v ?? "")} items={Object.fromEntries(items.map(i => [i.id, i.name]))}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                    {i.sku ? ` · ${i.sku}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType((v as MovementType) ?? "in")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock in (+)</SelectItem>
                  <SelectItem value="out">Stock out (−)</SelectItem>
                  <SelectItem value="adjust">Adjust (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" step="any" min="0" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" name="note" placeholder="e.g. PO #1042, dispatch to line 3" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
