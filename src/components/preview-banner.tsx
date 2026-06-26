import { Info } from "lucide-react";
import { supabaseConfigured } from "@/lib/supabase/config";

/** Shown when running without real Supabase keys, so the UI is browsable. */
export function PreviewBanner() {
  if (supabaseConfigured) return null;
  return (
    <div className="flex items-center gap-2 border-b border-amber-800/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
      <Info className="size-3.5 shrink-0" />
      <span>
        <strong>Preview mode</strong> — showing sample data. Add your own Supabase
        keys to <code className="font-mono">.env.local</code> and run the migration
        in <code className="font-mono">supabase/migrations</code> to go live.
      </span>
    </div>
  );
}
