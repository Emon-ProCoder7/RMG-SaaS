"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search, ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
import { deleteItem } from "@/lib/inventory/actions";
import type { Category, ItemWithCategory } from "@/lib/inventory/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemDialog } from "./item-dialog";
import { MovementDialog } from "./movement-dialog";

export function ItemsTable({
  items,
  categories,
}: {
  items: ItemWithCategory[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ItemWithCategory | null>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementItemId, setMovementItemId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.sku ?? "").toLowerCase().includes(q) ||
        (i.category?.name ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  function onDelete(item: ItemWithCategory) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteItem(item.id);
      if (!res.ok) {
        toast.error(res.error ?? "Could not delete");
        return;
      }
      toast.success("Item deleted");
      router.refresh();
    });
  }

  function openMovement(itemId?: string) {
    setMovementItemId(itemId);
    setMovementOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, SKU, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => openMovement()}>
            <ArrowLeftRight className="size-4" />
            Movement
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add item
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const low = Number(item.quantity) <= Number(item.reorder_level);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.sku ?? "—"}
                    </TableCell>
                    <TableCell>
                      {item.category?.name ? (
                        <Badge variant="secondary">{item.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="tabular-nums">
                        {formatNumber(Number(item.quantity))} {item.unit}
                      </span>
                      {low && (
                        <Badge variant="destructive" className="ml-2">
                          Low
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(Number(item.cost_price))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(Number(item.quantity) * Number(item.cost_price))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" disabled={pending} />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(item)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openMovement(item.id)}>
                            <ArrowLeftRight className="size-4" />
                            Stock movement
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ItemDialog open={addOpen} onOpenChange={setAddOpen} categories={categories} />
      <ItemDialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        categories={categories}
        item={editing}
      />
      <MovementDialog
        open={movementOpen}
        onOpenChange={setMovementOpen}
        items={items}
        defaultItemId={movementItemId}
      />
    </div>
  );
}
