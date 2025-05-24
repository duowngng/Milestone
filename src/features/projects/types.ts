import { Models } from "node-appwrite";
import { AdminProjectMember } from "../members/types";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  workspaceId: string;
};

export type AdminProject = Project & {
  workspace: {
    name: string;
  };
  members: AdminProjectMember[];
};
