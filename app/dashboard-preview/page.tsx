import { redirect } from "next/navigation";

/**
 * Legacy preview route. Kept as a permanent redirect so any older bookmarks
 * or backlinks still work; the canonical "coming soon" content lives on
 * /dashboard.
 */
export default function DashboardPreviewPage() {
  redirect("/dashboard");
}
