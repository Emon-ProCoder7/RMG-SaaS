"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Loader2 } from "lucide-react";

import { createSupplier } from "@/lib/inventory/actions";
import type { Supplier } from "@/lib/inventory/types";

type Props = { supplier?: Supplier };

export function SupplierFormDialog({ supplier }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wrappedAction = async (_prev: unknown, fd: FormData) => createSupplier(fd);
  const [state, formAction, pending] = useActionState(wrappedAction, { ok: false });

  useEffect(() => {
    if (open && formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [open]);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={supplier ? <Button variant="outline" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button> : <Button className="bg-gold-metallic text-black font-semibold shadow-md hover:shadow-lg"><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button>} />
      <DialogContent className="max-w-lg bg-gradient-to-br from-card to-amber-900/20 border-amber-800/30">
        <DialogHeader>
          <DialogTitle className="text-amber-100">{supplier ? "Edit Supplier" : "New Supplier"}</DialogTitle>
          <DialogDescription>Enter supplier details.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {supplier && <input type="hidden" name="id" value={supplier.id} />}
          <div className="col-span-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input id="name" name="name" defaultValue={supplier?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input id="contact_person" name="contact_person" defaultValue={supplier?.contact_person ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={supplier?.email ?? ""} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={supplier?.address ?? ""} />
          </div>
          <div>
            <Label htmlFor="vat_no">VAT No.</Label>
            <Input id="vat_no" name="vat_no" defaultValue={supplier?.vat_no ?? ""} />
          </div>
          <div>
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Input id="payment_terms" name="payment_terms" defaultValue={supplier?.payment_terms ?? ""} placeholder="Net 30" />
          </div>
          {state.error && !state.ok && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-gold-metallic text-black font-semibold">
              {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {supplier ? "Update" : "Create"} Supplier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
