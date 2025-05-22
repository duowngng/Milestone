import { CopyIcon, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { AdminWorkspaceMember, MemberRole } from "@/features/members/types";
import { MemberActions } from "@/features/members/workspace/components/admin/member-actions";
import { Button } from "@/components/ui/button";

export function MembersList({ members }: { members: AdminWorkspaceMember[] }) {
  if (!members || members.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No members found in this workspace
      </div>
    );
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Member ID copied to clipboard");
  };

  return (
    <>
      {members.map((member) => (
        <TableRow
          key={member.$id}
          className="border-b border-border/50 hover:bg-gray-50 bg-gray-100"
        >
          <TableCell className="py-3 pl-8">
            <div className="flex flex-col">
              <span className="font-medium">
                {member.user?.name || "Unknown User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {member.user?.email}
              </span>
            </div>
          </TableCell>
          <TableCell colSpan={2}>
            <Badge
              variant="secondary"
              className="font-mono text-xs cursor-pointer w-fit border border-gray-300"
              onClick={() => handleCopy(member.$id)}
            >
              <CopyIcon className="size-3 mr-2" />
              {member.$id}
            </Badge>
          </TableCell>
          <TableCell className="py-3 px-4" colSpan={2}>
            <Badge
              variant="outline"
              className={
                member.role === MemberRole.MANAGER
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }
            >
              {member.role}
            </Badge>
          </TableCell>
          <TableCell>
            <span className="text-sm">
              {member.$updatedAt
                ? format(new Date(member.$createdAt), "PPp")
                : "N/A"}
            </span>
          </TableCell>
          <TableCell>
            <span className="text-sm">
              {member.$updatedAt
                ? format(new Date(member.$updatedAt), "PPp")
                : "N/A"}
            </span>
          </TableCell>
          <TableCell colSpan={2}>
            <MemberActions id={member.$id}>
              <Button variant="ghost" className="size-8 p-0">
                <MoreVertical className="size-4" />
              </Button>
            </MemberActions>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
