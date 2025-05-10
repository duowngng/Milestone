import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, PROJECT_MEMBERS_ID } from "@/config";

import { MemberRole, ProjectMember } from "../types";

interface GetProjectMemberProps {
  databases: Databases;
  projectId: string;
  userId: string;
}

export const getProjectMember = async ({
  databases,
  projectId,
  userId,
}: GetProjectMemberProps) => {
  const projectMembers = await databases.listDocuments<ProjectMember>(
    DATABASE_ID,
    PROJECT_MEMBERS_ID,
    [Query.equal("projectId", projectId), Query.equal("userId", userId)]
  );

  return projectMembers.documents[0];
};

export const isProjectManager = (member: ProjectMember) => {
  return member.role === MemberRole.MANAGER;
};
