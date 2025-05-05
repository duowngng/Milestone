import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { MembersList } from "@/features/members/components/members-list";
import { AddMemberModal } from "@/features/members/project/components/add-member-modal";

const WorkspaceIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full lg:max-w-xl">
      <AddMemberModal />
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
