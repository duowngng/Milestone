"use client";

import { useParams } from "next/navigation";

import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { useGetMembers } from "@/features/members/workspace/api/use-get-members";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface TasksClientProps {
  userId: string;
}

const TasksClient = ({ userId }: TasksClientProps) => {
  const { workspaceId } = useParams();
  const { data: members, isLoading } = useGetMembers({
    workspaceId: workspaceId as string,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!members) {
    return <PageError message="Failed to load workspace data" />;
  }

  const currentMember = members.documents.find(
    (member) => member.userId === userId
  );

  return (
    <div className="h-fit flex flex-col">
      <TaskViewSwitcher memberId={currentMember?.$id} />
    </div>
  );
};

export default TasksClient;
