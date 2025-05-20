import { CreateMilestoneForm } from "./create-milestone-form";

interface CreateMilestoneFormWrapperProps {
  onCancel: () => void;
  initialDate?: Date;
}

export const CreateMilestoneFormWrapper = ({
  onCancel,
  initialDate,
}: CreateMilestoneFormWrapperProps) => {
  return (
    <div>
      <CreateMilestoneForm onCancel={onCancel} initialDate={initialDate} />
    </div>
  );
};
