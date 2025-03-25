import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminWorkspacesClient } from "./client";

const AdminWorkspacesPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminWorkspacesClient />;
};

export default AdminWorkspacesPage;
