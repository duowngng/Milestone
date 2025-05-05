import { z } from "zod";

export const createProjectMembersSchema = z.object({
  projectId: z.string(),
  userIds: z.array(z.string()).min(1),
});
