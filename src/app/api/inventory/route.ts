import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/lib/inventory/queries";
import { getItems } from "@/lib/inventory/queries";
import { getSalePriceHistory } from "@/lib/inventory/queries";
import { MOCK_SALE_PRICES } from "@/lib/mock";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customer_id");

  const [customers, items] = await Promise.all([getCustomers(), getItems()]);

  let priceHistory = MOCK_SALE_PRICES;
  if (customerId) {
    const filtered = await Promise.all(
      items.map(async (item) => {
        const ph = await getSalePriceHistory(customerId, item.id);
        return ph;
      })
    );
    priceHistory = filtered.filter(Boolean) as any;
  }

  return NextResponse.json({ customers, items, priceHistory });
}
