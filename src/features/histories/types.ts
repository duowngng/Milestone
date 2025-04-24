import { Models } from "node-appwrite";

export type History = Models.Document & {
  taskId: string;
  editorId: string;
  fields: string[];
  oldValues: string;
  newValues: string;
};
