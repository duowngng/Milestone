"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { DottedSeparator } from "@/components/dotted-separator";
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { createMilestoneSchema } from "../schemas";
import { useCreateMilestone } from "../api/use-create-milestone";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

interface CreateMilestoneFormProps {
  onCancel?: () => void;
  initialDate?: Date;
}

export const CreateMilestoneForm = ({
  onCancel,
  initialDate,
}: CreateMilestoneFormProps) => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateMilestone();

  const form = useForm<z.infer<typeof createMilestoneSchema>>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      workspaceId: workspaceId,
      projectId: projectId,
      name: "",
      date: initialDate ? new Date(initialDate) : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof createMilestoneSchema>) => {
    mutate(
      { json: { ...values } },
      {
        onSuccess: () => {
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new milestone
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter milestone name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" size="lg" disabled={isPending}>
                Create Milestone
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
