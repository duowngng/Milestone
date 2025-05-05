"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";

import { MembersWorkspace } from "./members-workspace";
import { MembersProject } from "./members-project";
import { usePrefetchProjectMembers } from "../project/hooks/use-prefetch-project-members";
import { useGetCurrentMember } from "../workspace/api/use-get-current-member";
import { isWorkspaceManager } from "../workspace/utils";
import { PageLoader } from "@/components/page-loader";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();

  const [activeTab, setActiveTab] = useQueryState("members-view", {
    defaultValue: "workspace",
  });

  const { data: currentMember, isLoading: isLoadingCurrent } =
    useGetCurrentMember({ workspaceId });

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });

  const isLoading = isLoadingCurrent || isLoadingProjects;

  usePrefetchProjectMembers({
    workspaceId,
    projects: projects?.documents,
    shouldPrefetch: activeTab === "project",
  });

  if (isLoading) {
    return <PageLoader />;
  }

  const isManager = currentMember && isWorkspaceManager(currentMember);

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members list</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator className="mb-4" />
      </div>
      <CardContent className="p-7 pt-0">
        {isManager ? (
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger className="h-8 w-full lg:w-auto" value="workspace">
                Workspace Members
              </TabsTrigger>
              <TabsTrigger className="h-8 w-full lg:w-auto" value="project">
                Project Members
              </TabsTrigger>
            </TabsList>
            <DottedSeparator className="my-4" />
            <TabsContent value="workspace">
              <MembersWorkspace />
            </TabsContent>
            <TabsContent value="project">
              <MembersProject
                projects={projects?.documents || []}
                isLoadingProjects={isLoadingProjects}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <MembersWorkspace />
          </>
        )}
      </CardContent>
    </Card>
  );
};
