"use client";

import { Fragment, useState } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetCurrentProjectMember } from "@/features/members/project/api/use-get-current-project-member";
import { isProjectManager } from "@/features/members/project/utils";
import { useGetProjectMembers } from "@/features/members/project/api/use-get-project-members";
import { useDeleteProjectMember } from "@/features/members/project/api/use-delete-project-member";
import { useUpdateProjectMember } from "@/features/members/project/api/use-update-project-member";
import { MemberRole } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useCurrent } from "@/features/auth/api/use-current";

import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ProjectIdMembersClient = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data: currentUser } = useCurrent();

  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the project",
    "destructive"
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data } = useGetProjectMembers({
    workspaceId,
    projectId,
  });
  const { data: currentMember } = useGetCurrentProjectMember({
    workspaceId,
    projectId,
    enabled: !!projectId && !!workspaceId,
  });

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteProjectMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateProjectMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
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

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/workspaces/${workspaceId}/projects/${projectId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members list</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => {
          const isCurrentUser =
            currentUser && currentUser.$id === member.userId;

          return (
            <Fragment key={member.$id}>
              <div className="flex items-center gap-2">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                {!isCurrentUser &&
                  currentMember &&
                  isProjectManager(currentMember) && (
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
              {index < data.documents.length - 1 && (
                <Separator className="my-2.5" />
              )}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};
