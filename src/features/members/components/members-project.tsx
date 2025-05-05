"use client";

import { useEffect, useState } from "react";
import { MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageLoader } from "@/components/page-loader";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useGetProjectMembers } from "@/features/members/project/api/use-get-project-members";
import { useUpdateProjectMember } from "@/features/members/project/api/use-update-project-member";
import { useDeleteProjectMember } from "@/features/members/project/api/use-delete-project-member";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { MemberRole } from "@/features/members/types";

import { ProjectSelect } from "@/features/members/project/components/project-select";
import { useProjectSelect } from "@/features/members/project/hooks/use-project-select";
import { useCurrent } from "@/features/auth/api/use-current";

interface MembersProjectProps {
  projects: { $id: string; name: string }[];
  isLoadingProjects: boolean;
}

export const MembersProject = ({
  projects,
  isLoadingProjects,
}: MembersProjectProps) => {
  const workspaceId = useWorkspaceId();
  const [{ projectId }, setProjectId] = useProjectSelect();
  const { data: currentUser } = useCurrent();

  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the project",
    "destructive"
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId({ projectId: projects[0].$id });
    }
  }, [projectId, projects, setProjectId]);

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateProjectMember();
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteProjectMember();

  const { data: members, isLoading: isLoadingMembers } = useGetProjectMembers({
    projectId: projectId || "",
    workspaceId,
  });

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      param: { memberId },
      json: { role },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    setOpenMenuId(null);

    const ok = await confirm();

    if (!ok || !projectId) {
      return;
    }

    deleteMember({ param: { memberId }, projectId: projectId });
  };

  const projectOptions = projects.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  return (
    <div className="w-full space-y-4">
      <ConfirmDialog />
      {isLoadingProjects ? (
        <PageLoader />
      ) : (
        <>
          <ProjectSelect
            projects={projectOptions}
            isLoading={isLoadingProjects}
          />
          <DottedSeparator className="my-4" />
          {isLoadingMembers ? (
            <PageLoader />
          ) : members?.documents.length ? (
            members.documents.map((member, index) => {
              const isCurrentUser =
                currentUser && currentUser.$id === member.userId;

              return (
                <div key={member.$id}>
                  <div className="flex items-center gap-2">
                    <MemberAvatar
                      className="size-10"
                      fallbackClassName="text-lg"
                      name={member.name}
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {member.name}
                        {member.role === MemberRole.MANAGER && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            Manager
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    {!isCurrentUser && (
                      <DropdownMenu
                        open={openMenuId === member.$id}
                        onOpenChange={(open) => {
                          setOpenMenuId(open ? member.$id : null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="ml-auto"
                            size="icon"
                            variant="secondary"
                          >
                            <MoreVerticalIcon className="size-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() =>
                              handleUpdateMember(member.$id, MemberRole.MANAGER)
                            }
                            disabled={isUpdatingMember}
                          >
                            Set as Project Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium"
                            onClick={() =>
                              handleUpdateMember(member.$id, MemberRole.MEMBER)
                            }
                            disabled={isUpdatingMember}
                          >
                            Set as Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="font-medium text-red-700"
                            onClick={() => handleDeleteMember(member.$id)}
                            disabled={isDeletingMember}
                          >
                            Remove {member.name}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {index < members.documents.length - 1 && (
                    <Separator className="my-2.5" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground mt-4">
              No members in this project.
            </p>
          )}
        </>
      )}
    </div>
  );
};
