import { PageHeader } from "@/components/page-header";
import { ItemsTable } from "@/components/inventory/items-table";
import { getCategories, getItems } from "@/lib/inventory/queries";

export const metadata = { title: "Inventory · RMG Suite" };

export default async function InventoryPage() {
  const [items, categories] = await Promise.all([getItems(), getCategories()]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="All stock items, quantities and valuations."
      />
      <ItemsTable items={items} categories={categories} />
    </div>
  );
}
