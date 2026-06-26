import { Suspense } from "react";
import { getSuppliers } from "@/lib/inventory/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SupplierFormDialog } from "./supplier-form-dialog";

async function SupplierTable() {
  const suppliers = await getSuppliers();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-50/50">
              <TableHead className="font-semibold text-indigo-800">Name</TableHead>
              <TableHead className="font-semibold text-indigo-800">Contact Person</TableHead>
              <TableHead className="font-semibold text-indigo-800">Phone</TableHead>
              <TableHead className="font-semibold text-indigo-800">Email</TableHead>
              <TableHead className="font-semibold text-indigo-800">Payment Terms</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-center">Status</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No suppliers yet.</TableCell></TableRow>
            ) : suppliers.map((s) => (
              <TableRow key={s.id} className="hover:bg-amber-50/30 transition-colors">
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_person ?? "—"}</TableCell>
                <TableCell>{s.phone ?? "—"}</TableCell>
                <TableCell>{s.email ?? "—"}</TableCell>
                <TableCell>{s.payment_terms ?? "—"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={s.is_active ? "default" : "secondary"} className={s.is_active ? "bg-green-100 text-green-800" : ""}>
                    {s.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <SupplierFormDialog supplier={s} />
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
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage your suppliers and vendors</p>
        </div>
        <SupplierFormDialog />
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <SupplierTable />
      </Suspense>
    </div>
  );
}
