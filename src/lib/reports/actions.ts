"use server";

import { getZakatData } from ".";

export async function fetchZakatData() {
  const data = await getZakatData();
  return data;
}
