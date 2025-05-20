import { Models } from "node-appwrite";

export type Milestone = Models.Document & {
  projectId: string;
  workspaceId: string;
  name: string;
  date: string;
};
