import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminTasksClient } from "./client";

const AdminTasksPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminTasksClient />;
};

export default AdminTasksPage;
