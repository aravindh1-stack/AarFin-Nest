import { redirect } from "next/navigation";

export default function PendingAccessRedirect() {
  // Deprecated route: automatically redirect to /login with PENDING_APPROVAL status
  redirect("/login?error=PENDING_APPROVAL");
}
