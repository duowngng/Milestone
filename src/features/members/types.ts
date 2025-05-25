import { Models } from "node-appwrite";

export enum MemberRole {
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
  WORKSPACE_MANAGER = "WORKSPACE_MANAGER",
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

export type ProjectMember = Models.Document & {
  projectId: string;
  userId: string;
  role: MemberRole;
};

export type AdminProjectMember = ProjectMember & {
  user: {
    name: string;
    email: string;
  };
  project: {
    name: string;
  };
};
