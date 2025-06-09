import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateMemberModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-member",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [initialWorkspaceId, setInitialWorkspaceId] =
    useQueryState("initialWorkspaceId");

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    initialWorkspaceId,
    setInitialWorkspaceId,
  };
};
