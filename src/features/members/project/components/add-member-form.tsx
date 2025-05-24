"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DottedSeparator } from "@/components/dotted-separator";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { useBulkCreateProjectMembers } from "../api/use-bulk-create-project-members";
import { createProjectMembersSchema } from "../schemas";

type AddMembersValues = z.infer<typeof createProjectMembersSchema>;

interface AddMemberFormProps {
  onCancel?: () => void;
  projectId: string;
  memberOptions: { id: string; name: string; email: string }[];
  currentProjectMembers: { userId: string; name: string; email: string }[];
}

export const AddMemberForm = ({
  onCancel,
  projectId,
  memberOptions,
  currentProjectMembers,
}: AddMemberFormProps) => {
  const { mutate, isPending } = useBulkCreateProjectMembers();

  const form = useForm<AddMembersValues>({
    resolver: zodResolver(createProjectMembersSchema),
    defaultValues: { projectId, userIds: [] },
  });

  const { control, watch, setValue, handleSubmit } = form;

  const selectedIds = watch("userIds");

  const currentMemberIds = currentProjectMembers.map((member) => member.userId);

  const sortedMemberOptions = [...memberOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  function handleAdd(id: string) {
    if (!selectedIds.includes(id)) {
      setValue("userIds", [...selectedIds, id]);
    }
  }

  function handleRemove(id: string) {
    setValue(
      "userIds",
      selectedIds.filter((memberId) => memberId !== id)
    );
  }

  function onSubmit(values: AddMembersValues) {
    console.log("Adding members:", values);
    mutate(
      { json: { projectId: values.projectId, userIds: values.userIds } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-bold">
          Add members to project
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={control}
                name="userIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Search Members</FormLabel>
                    <FormControl>
                      <Command className="rounded-lg border">
                        <CommandInput placeholder="Type to search members..." />
                        <CommandList>
                          <CommandEmpty>No members found.</CommandEmpty>
                          <CommandGroup className="max-h-48 overflow-y-auto">
                            {sortedMemberOptions.map((member) => {
                              const isCurrentMember =
                                currentMemberIds?.includes(member.id);

                              return (
                                <CommandItem key={member.id}>
                                  <div className="flex items-center gap-x-2 flex-1">
                                    <MemberAvatar
                                      className="size-8"
                                      fallbackClassName="text-sm"
                                      name={member.name}
                                    />
                                    <div className="flex flex-col">
                                      <p className="text-sm font-medium">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                  {isCurrentMember ? (
                                    <span className="flex items-center text-xs text-muted-foreground">
                                      <Check className="size-3 mr-1" />
                                      Member
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAdd(member.id)}
                                      disabled={
                                        selectedIds.includes(member.id) ||
                                        isPending
                                      }
                                    >
                                      Add
                                    </Button>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedIds.length > 0 && (
                <div className="flex flex-col gap-y-2">
                  <p className="text-sm font-medium">New Members</p>
                  <div className="flex flex-col">
                    {selectedIds.map((id, index) => {
                      const member = memberOptions.find((m) => m.id === id)!;
                      const isFirst = index === 0;
                      const isLast = index === selectedIds.length - 1;
                      const isSingle = selectedIds.length === 1;

                      return (
                        <div
                          key={id}
                          className={cn(
                            "flex items-center justify-between p-2 border",
                            isSingle
                              ? "rounded-lg"
                              : isFirst
                              ? "rounded-t-lg"
                              : isLast
                              ? "rounded-b-lg"
                              : ""
                          )}
                        >
                          <div className="flex items-center gap-x-2">
                            <MemberAvatar
                              className="size-8"
                              fallbackClassName="text-sm"
                              name={member.name}
                            />
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemove(id)}
                            disabled={isPending}
                          >
                            <X className="size-4 text-muted-foreground" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isPending || selectedIds.length === 0}
              >
                {selectedIds.length <= 1 ? "Add Member" : "Add Members"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
