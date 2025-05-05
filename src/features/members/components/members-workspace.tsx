"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { MemberAvatar } from "./member-avatar";
import { useDeleteMember } from "../workspace/api/use-delete-member";
import { useUpdateMember } from "../workspace/api/use-update-member";
import { useGetMembers } from "../workspace/api/use-get-members";
import { useGetCurrentMember } from "../workspace/api/use-get-current-member";
import { isWorkspaceManager } from "../workspace/utils";
import { MemberRole } from "../types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";

export const MembersWorkspace = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();

  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace",
    "destructive"
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data } = useGetMembers({ workspaceId });
  const { data: currentMember } = useGetCurrentMember({ workspaceId });

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    setOpenMenuId(null);

    const ok = await confirm();

    if (!ok) {
      return;
    }

    deleteMember({ param: { memberId } });
  };

  return (
    <div>
      <ConfirmDialog />
      {data?.documents.map((member, index) => {
        const isCurrentUser = currentUser && currentUser.$id === member.userId;

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
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              {!isCurrentUser &&
                currentMember &&
                isWorkspaceManager(currentMember) && (
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
                        Set as Workspace Manager
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
    </div>
  );
};
