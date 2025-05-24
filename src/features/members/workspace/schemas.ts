import { z } from "zod";
import { MemberRole } from "../types";

export const adminCreateMemberSchema = z.object({
  workspaceId: z.string().trim().min(1, "Workspace ID is required"),
  userId: z.string().trim().min(1, "User ID is required"),
  role: z.nativeEnum(MemberRole),
});

export const adminUpdateMemberSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  workspaceId: z.string().trim().min(1).optional(),
  role: z.nativeEnum(MemberRole).optional(),
});
