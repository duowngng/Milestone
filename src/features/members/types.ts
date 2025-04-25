import { Models } from "node-appwrite";

export enum MemberRole {
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}

export type WorkspaceMember = Models.Document & {
  workspaceId: string;
  userId: string;
  role: MemberRole;
};

export type AdminWorkspaceMember = WorkspaceMember & {
  user: {
    name: string;
    email: string;
  };
  workspace: {
    name: string;
  };
};
