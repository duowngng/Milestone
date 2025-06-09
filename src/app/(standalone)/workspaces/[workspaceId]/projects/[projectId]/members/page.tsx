import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { ProjectIdMembersClient } from "./client";

const ProjectIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("sign-in");
  }

  return (
    <div className="w-full lg:max-w-xl">
      <ProjectIdMembersClient />
    </div>
  );
};

export default ProjectIdMembersPage;
