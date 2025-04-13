import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminMembersClient } from "./client";

const AdminMembersPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminMembersClient />;
};

export default AdminMembersPage;
