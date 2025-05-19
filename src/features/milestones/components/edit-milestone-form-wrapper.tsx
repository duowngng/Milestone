import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { EditMilestoneForm } from "./edit-milestone-form";
import { useGetMilestone } from "../api/use-get-milestone";

interface EditMilestoneFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditMilestoneFormWrapper = ({
  onCancel,
  id,
}: EditMilestoneFormWrapperProps) => {
  const { data: initialValues, isLoading } = useGetMilestone({
    milestoneId: id,
  });

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValues) {
    return null;
  }

  return (
    <div>
      <EditMilestoneForm onCancel={onCancel} initialValues={initialValues} />
    </div>
  );
};
