"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createItem, updateItem } from "@/lib/inventory/actions";
import type { Category, ItemWithCategory } from "@/lib/inventory/types";
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

const UNCATEGORIZED = "__none__";

export function ItemDialog({
  open,
  onOpenChange,
  categories,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  item?: ItemWithCategory | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const editing = Boolean(item);
  const [categoryId, setCategoryId] = useState(
    item?.category_id ?? UNCATEGORIZED,
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("category_id", categoryId === UNCATEGORIZED ? "" : categoryId);
    if (editing && item) fd.set("id", item.id);
    startTransition(async () => {
      const res = editing ? await updateItem(fd) : await createItem(fd);
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      toast.success(editing ? "Item updated" : "Item added");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update item details. Quantity changes are made via stock movements."
              : "Add a new item to the inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={item?.name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={item?.sku ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? UNCATEGORIZED)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue={item?.unit ?? "pcs"} />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Opening qty</Label>
                <Input id="quantity" name="quantity" type="number" step="any" defaultValue={0} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder level</Label>
              <Input
                id="reorder_level"
                name="reorder_level"
                type="number"
                step="any"
                defaultValue={item?.reorder_level ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost price</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="any"
                defaultValue={item?.cost_price ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale price</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="any"
                defaultValue={item?.sale_price ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" name="supplier" defaultValue={item?.supplier ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={item?.location ?? ""} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
