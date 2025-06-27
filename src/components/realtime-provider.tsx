"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client, RealtimeResponseEvent } from "appwrite"; // Import RealtimeResponseEvent
import {
  DATABASE_ID,
  TASKS_ID,
  PROJECTS_ID,
  MILESTONES_ID,
  WORKSPACE_MEMBERS_ID,
  PROJECT_MEMBERS_ID,
  HISTORIES_ID,
} from "@/config";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

export const RealtimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const buildChannel = (collectionId: string) =>
      `databases.${DATABASE_ID}.collections.${collectionId}.documents`;

    const invalidateMultipleQueries = (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    };

    const createCallback = (collectionName: string, queryKeys: string[]) => {
      return (payload: RealtimeResponseEvent<unknown>) => {
        console.log(`Realtime event received for ${collectionName}:`, payload);
        invalidateMultipleQueries(queryKeys);
      };
    };

    const taskUnsubscribe = client.subscribe(
      buildChannel(TASKS_ID),
      createCallback("TASKS", [
        "tasks",
        "admin-tasks",
        "project-analytics",
        "workspace-analytics",
        "history",
      ])
    );

    const projectUnsubscribe = client.subscribe(
      buildChannel(PROJECTS_ID),
      createCallback("PROJECTS", [
        "projects",
        "admin-projects",
        "project-analytics",
        "workspace-analytics",
      ])
    );

    const milestoneUnsubscribe = client.subscribe(
      buildChannel(MILESTONES_ID),
      createCallback("MILESTONES", [
        "milestones",
        "project-analytics",
        "workspace-analytics",
      ])
    );

    const workspaceMembersUnsubscribe = client.subscribe(
      buildChannel(WORKSPACE_MEMBERS_ID),
      createCallback("WORKSPACE_MEMBERS", ["members", "admin-members"])
    );

    const projectMembersUnsubscribe = client.subscribe(
      buildChannel(PROJECT_MEMBERS_ID),
      createCallback("PROJECT_MEMBERS", [
        "projectMembers",
        "admin-project-members",
      ])
    );

    const historiesUnsubscribe = client.subscribe(
      buildChannel(HISTORIES_ID),
      createCallback("HISTORIES", ["history"])
    );

    return () => {
      console.log("Cleaning up realtime subscriptions.");
      taskUnsubscribe();
      projectUnsubscribe();
      milestoneUnsubscribe();
      workspaceMembersUnsubscribe();
      projectMembersUnsubscribe();
      historiesUnsubscribe();
    };
  }, [queryClient]);

  return <>{children}</>;
};
