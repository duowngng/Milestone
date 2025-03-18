import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import TasksClient from "./client";

const TasksPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  return <TasksClient userId={user.$id} />;
};

export default TasksPage;
