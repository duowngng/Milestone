import { useQueryState, parseAsString } from "nuqs";

export const useEditWorkspaceModal = () => {
  const [workspaceId, setWorkspaceId] = useQueryState(
    "edit-workspace",
    parseAsString
  );

  const open = (id: string) => setWorkspaceId(id);
  const close = () => setWorkspaceId(null);

  return {
    workspaceId,
    open,
    close,
    setWorkspaceId,
  };
};
