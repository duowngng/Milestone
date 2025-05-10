import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, WORKSPACE_MEMBERS_ID } from "@/config";

import { MemberRole, WorkspaceMember } from "../types";

interface GetWorkspaceMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getWorkspaceMember = async ({
  databases,
  userId,
  workspaceId,
}: GetWorkspaceMemberProps) => {
  const workspaceMembers = await databases.listDocuments<WorkspaceMember>(
    DATABASE_ID,
    WORKSPACE_MEMBERS_ID,
    [Query.equal("workspaceId", workspaceId), Query.equal("userId", userId)]
  );

  return workspaceMembers.documents[0];
};

export const isWorkspaceManager = (member: WorkspaceMember) => {
  return member.role === MemberRole.MANAGER;
};
