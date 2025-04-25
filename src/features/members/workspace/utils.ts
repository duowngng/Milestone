import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, WORKSPACE_MEMBERS_ID } from "@/config";

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
  const workspaceMembers = await databases.listDocuments(
    DATABASE_ID,
    WORKSPACE_MEMBERS_ID,
    [Query.equal("workspaceId", workspaceId), Query.equal("userId", userId)]
  );

  return workspaceMembers.documents[0];
};
