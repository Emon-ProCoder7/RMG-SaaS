import { PageHeader } from "@/components/page-header";
import { CategoryToolbar } from "@/components/inventory/category-toolbar";
import { getCategories, getItems } from "@/lib/inventory/queries";
import { formatNumber } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Categories · RMG Suite" };

export default async function CategoriesPage() {
  const [categories, items] = await Promise.all([getCategories(), getItems()]);

  const counts = new Map<string, number>();
  for (const i of items) {
    if (i.category_id)
      counts.set(i.category_id, (counts.get(i.category_id) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader title="Categories" description="Group inventory items by type.">
        <CategoryToolbar />
      </PageHeader>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(counts.get(c.id) ?? 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
