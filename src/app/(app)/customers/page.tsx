import { Suspense } from "react";
import { getCustomers, getCustomerBalance } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpDown } from "lucide-react";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerDetailDialog } from "./customer-detail-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteCustomer } from "@/lib/inventory/actions";

async function CustomerTable() {
  const customers = await getCustomers();
  const balances = await Promise.all(customers.map((c) => getCustomerBalance(c.id).then((b) => ({ id: c.id, balance: b }))));
  const balanceMap = Object.fromEntries(balances.map((b) => [b.id, b.balance]));

  return (
    <Card className="border-0 shadow-md bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20">
              <TableHead className="font-semibold text-amber-200">Name</TableHead>
              <TableHead className="font-semibold text-amber-200 hidden md:table-cell">Mobile</TableHead>
              <TableHead className="font-semibold text-amber-200 hidden md:table-cell">Address</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right hidden md:table-cell">Credit Limit</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Balance</TableHead>
              <TableHead className="font-semibold text-amber-200 text-center hidden md:table-cell">Status</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers yet. Add your first customer.</TableCell></TableRow>
            ) : customers.map((c) => (
              <TableRow key={c.id} className="hover:bg-amber-500/5 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    {c.name_ar && <p className="text-xs text-muted-foreground" dir="rtl">{c.name_ar}</p>}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{c.mobile ?? "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate hidden md:table-cell">{c.address ?? "—"}</TableCell>
                <TableCell className="text-right hidden md:table-cell">{formatCurrency(c.credit_limit)}</TableCell>
                <TableCell className="text-right">
                  <span className={balanceMap[c.id] > 0 ? "text-amber-400 font-semibold" : "text-green-400"}>
                    {formatCurrency(balanceMap[c.id] ?? 0)}
                  </span>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <Badge variant={c.is_active ? "default" : "secondary"} className={c.is_active ? "bg-green-500/15 text-green-300" : ""}>
                    {c.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CustomerFormDialog customer={c} />
                    <CustomerDetailDialog customer={c} initialBalance={balanceMap[c.id] ?? 0} />
                    <DeleteButton id={c.id} label={c.name} action={deleteCustomer} />
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

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-amber-50">Customers</h1>
            <p className="text-sm text-amber-400/60 mt-0.5">Manage your customer base</p>
          </div>
        </div>
        <CustomerFormDialog />
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CustomerTable />
      </Suspense>
    </div>
  );
}
