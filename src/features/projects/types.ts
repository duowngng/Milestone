import { Models } from "node-appwrite";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  workspaceId: string;
};

export type AdminProject = Project & {
  workspace: {
    name: string;
  };
};
