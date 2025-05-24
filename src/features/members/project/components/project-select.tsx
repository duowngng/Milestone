import { useCallback } from "react";
import { FolderIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useProjectSelect } from "../hooks/use-project-select";
import { useAddMembersModal } from "../hooks/use-add-members-modal";

interface ProjectSelectProps {
  projects: { value: string; label: string }[];
  isLoading: boolean;
}

export const ProjectSelect = ({ projects, isLoading }: ProjectSelectProps) => {
  const { open } = useAddMembersModal();

  const [{ projectId }, setProjectId] = useProjectSelect();

  const onProjectChange = useCallback(
    (value: string) => {
      setProjectId({ projectId: value === "all" ? null : value });
    },
    [setProjectId]
  );

  return (
    <div className="flex flex-col lg:flex-row items-center lg:justify-between w-full space-y-2">
      <Select
        value={projectId ?? ""}
        onValueChange={(value) => onProjectChange(value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full lg:w-[150px] h-8">
          <div className="flex items-center pr-2">
            <FolderIcon className="size-4 mr-2" />
            <SelectValue placeholder="Select Project" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.value} value={project.value}>
              {project.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={() => open()} size="sm" className="w-full lg:w-auto">
        <PlusIcon className="size-4 mr-2" />
        Add Members
      </Button>
    </div>
  );
};
