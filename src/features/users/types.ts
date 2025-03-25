import { Models } from "node-appwrite";

export type User = Pick<
  Models.User<Record<string, unknown>>,
  "$id" | "name" | "email" | "labels" | "registration" | "accessedAt"
>;
