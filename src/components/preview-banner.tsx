import { Info } from "lucide-react";
import { supabaseConfigured } from "@/lib/supabase/config";

/** Shown when running without real Supabase keys, so the UI is browsable. */
export function PreviewBanner() {
  if (supabaseConfigured) return null;
  return (
    <div className="flex items-center gap-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <Info className="size-3.5 shrink-0" />
      <span>
        <strong>Preview mode</strong> — showing sample data. Add your own Supabase
        keys to <code className="font-mono">.env.local</code> and run the migration
        in <code className="font-mono">supabase/migrations</code> to go live.
      </span>
    </div>
  );
}
