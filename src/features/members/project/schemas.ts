import { z } from "zod";
import { MemberRole } from "../types";

export const createProjectMembersSchema = z.object({
  projectId: z.string(),
  userIds: z.array(z.string()).min(1),
});

export const adminUpdateProjectMemberSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  projectId: z.string(),
  role: z.nativeEnum(MemberRole).optional(),
});
