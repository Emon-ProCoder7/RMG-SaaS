"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ItemWithCategory } from "@/lib/inventory/types";
import { Button } from "@/components/ui/button";
import { MovementDialog } from "./movement-dialog";

export function MovementsToolbar({ items }: { items: ItemWithCategory[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Record movement
      </Button>
      <MovementDialog open={open} onOpenChange={setOpen} items={items} />
    </>
  );
}
