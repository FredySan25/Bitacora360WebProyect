import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/core/lib/supabase-server";
import { parseCatalogQuery, searchCatalog } from "@/features/watchlist/catalog/search";

/**
 * Searches the movie, series or book catalogs for the watchlist form:
 * `?type=movie|series|book&q=<title>`. It runs on the server so the catalog
 * keys never reach the browser, and only for a signed-in user so nobody else
 * spends them.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const query = parseCatalogQuery(request.nextUrl.searchParams);
  if (!query) return NextResponse.json({ error: "invalid_query" }, { status: 400 });

  try {
    const results = await searchCatalog(query);
    // The same search answers the same within a while; only this user's browser keeps it
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch (error) {
    console.error("Catalog search failed:", error);
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 502 });
  }
}
