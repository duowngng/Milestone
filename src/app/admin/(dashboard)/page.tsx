import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { AdminDashboardClient } from "./client";

const AdminDashBoardPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  if (!user.labels?.includes("admin")) {
    redirect("/admin/401");
  }

  return <AdminDashboardClient />;
};

export default AdminDashBoardPage;
