import { Models } from "node-appwrite";
import { AdminWorkspaceMember } from "../members/types";

export type Workspace = Models.Document & {
  name: string;
  imageUrl: string;
  inviteCode: string;
  userId: string;
};

export type AdminWorkspace = Workspace & {
  user: {
    name: string;
    email: string;
  };
  members: AdminWorkspaceMember[];
};
