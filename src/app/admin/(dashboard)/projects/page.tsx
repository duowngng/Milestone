import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminProjectsClient } from "./client";

const AdminProjectsPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminProjectsClient />;
};

export default AdminProjectsPage;
