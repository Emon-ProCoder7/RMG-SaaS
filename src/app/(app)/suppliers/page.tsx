import { Suspense } from "react";
import { getSuppliers } from "@/lib/inventory/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteSupplier } from "@/lib/inventory/actions";

async function SupplierTable() {
  const suppliers = await getSuppliers();

  return (
    <Card className="border-0 shadow-md bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20">
              <TableHead className="font-semibold text-amber-200">Name</TableHead>
              <TableHead className="font-semibold text-amber-200">Contact</TableHead>
              <TableHead className="font-semibold text-amber-200">Phone</TableHead>
              <TableHead className="font-semibold text-amber-200">Address</TableHead>
              <TableHead className="font-semibold text-amber-200 text-center">Status</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No suppliers yet. Add your first supplier.</TableCell></TableRow>
            ) : suppliers.map((s) => (
              <TableRow key={s.id} className="hover:bg-amber-500/5 transition-colors">
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_person ?? "—"}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{s.address ?? "—"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={s.is_active ? "default" : "secondary"} className={s.is_active ? "bg-green-500/15 text-green-300" : ""}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <SupplierFormDialog supplier={s} />
                    <DeleteButton id={s.id} label={s.name} action={deleteSupplier} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function SuppliersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-amber-50">Suppliers</h1>
            <p className="text-sm text-amber-400/60 mt-0.5">Manage your suppliers</p>
          </div>
        </div>
        <SupplierFormDialog />
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SupplierTable />
      </Suspense>
    </div>
  );
}
