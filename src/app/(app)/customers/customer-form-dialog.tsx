"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Loader2 } from "lucide-react";

import { createCustomer, updateCustomer } from "@/lib/inventory/actions";
import type { Customer } from "@/lib/inventory/types";

type Props = { customer?: Customer };

export function CustomerFormDialog({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const wrappedAction = customer
    ? async (_prev: unknown, fd: FormData) => updateCustomer(fd)
    : async (_prev: unknown, fd: FormData) => createCustomer(fd);
  const [state, formAction, pending] = useActionState(wrappedAction, { ok: false });
  const isEdit = !!customer;

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
      <DialogTrigger render={isEdit ? <Button variant="outline" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button> : <Button className="bg-gold-metallic text-black font-semibold shadow-md hover:shadow-lg"><Plus className="h-4 w-4 mr-1" /> Add Customer</Button>} />
      <DialogContent className="max-w-lg bg-gradient-to-br from-card to-amber-900/20 border-amber-800/30">
        <DialogHeader>
          <DialogTitle className="text-amber-100">{isEdit ? "Edit Customer" : "New Customer"}</DialogTitle>
          <DialogDescription>Fill in the customer details below.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isEdit && <input type="hidden" name="id" value={customer.id} />}
          <div className="col-span-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" name="name" defaultValue={customer?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="name_ar">Name (Arabic)</Label>
            <Input id="name_ar" name="name_ar" defaultValue={customer?.name_ar ?? ""} dir="rtl" />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" name="mobile" defaultValue={customer?.mobile ?? ""} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={customer?.email ?? ""} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
          </div>
          <div>
            <Label htmlFor="transport">Transport</Label>
            <Input id="transport" name="transport" defaultValue={customer?.transport ?? ""} />
          </div>
          <div>
            <Label htmlFor="vat_no">VAT No.</Label>
            <Input id="vat_no" name="vat_no" defaultValue={customer?.vat_no ?? ""} />
          </div>
          <div>
            <Label htmlFor="ledger_book_no">Ledger Book No.</Label>
            <Input id="ledger_book_no" name="ledger_book_no" defaultValue={customer?.ledger_book_no ?? ""} />
          </div>
          <div>
            <Label htmlFor="opening_bl">Opening Balance (BDT)</Label>
            <Input id="opening_bl" name="opening_bl" type="number" step="0.01" defaultValue={customer?.opening_bl ?? 0} />
          </div>
          <div>
            <Label htmlFor="credit_limit">Credit Limit (BDT)</Label>
            <Input id="credit_limit" name="credit_limit" type="number" step="0.01" defaultValue={customer?.credit_limit ?? 0} />
          </div>
          {state.error && !state.ok && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-gold-metallic text-black font-semibold">
              {pending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {isEdit ? "Update" : "Create"} Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
