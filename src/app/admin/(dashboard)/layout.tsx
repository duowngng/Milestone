import { CreateAdminWorkspaceModal } from "@/features/workspaces/components/admin/create-admin-workspace-modal";
import { CreateAdminMemberModal } from "@/features/members/workspace/components/admin/create-admin-member-modal";
import { CreateAdminProjectModal } from "@/features/projects/components/admin/create-admin-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditAdminWorkspaceModal } from "@/features/workspaces/components/admin/edit-admin-workspace-modal";
import { EditAdminMemberModal } from "@/features/members/workspace/components/admin/edit-admin-member-modal";
import { EditAdminProjectModal } from "@/features/projects/components/admin/edit-admin-project-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/admin/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <CreateAdminWorkspaceModal />
      <CreateAdminMemberModal />
      <CreateAdminProjectModal />
      <CreateTaskModal />
      <EditAdminWorkspaceModal />
      <EditAdminMemberModal />
      <EditAdminProjectModal />
      <EditTaskModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px] w-full">
          <div className="mx-auto max-w-screen-2xl h-full">
            <Navbar />
            <main className="h-full py-8 px-6 flex flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
