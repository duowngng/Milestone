import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminUsersClient } from "./client";

const AdminUsersPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminUsersClient />;
};

export default AdminUsersPage;
