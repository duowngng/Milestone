import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Must be at least 1 character").optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

export const adminCreateWorkspaceSchema = createWorkspaceSchema.extend({
  userId: z.string().trim().min(1, "Required"),
});

export const adminUpdateWorkspaceSchema = updateWorkspaceSchema.extend({
  userId: z.string().trim().min(1, "Must be at least 1 character").optional(),
  inviteCode: z
    .string()
    .trim()
    .length(6, "Must be exactly 6 characters")
    .optional(),
});
