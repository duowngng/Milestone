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

import { updateMilestoneSchema } from "../schemas";
import { useUpdateMilestone } from "../api/use-update-milestone";
import { Milestone } from "../types";

interface EditMilestoneFormProps {
  onCancel?: () => void;
  initialValues: Milestone;
}

export const EditMilestoneForm = ({
  onCancel,
  initialValues,
}: EditMilestoneFormProps) => {
  const { mutate, isPending } = useUpdateMilestone();

  const form = useForm<z.infer<typeof updateMilestoneSchema>>({
    resolver: zodResolver(updateMilestoneSchema),
    defaultValues: {
      name: initialValues.name,
      date: initialValues.date ? new Date(initialValues.date) : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof updateMilestoneSchema>) => {
    mutate(
      {
        json: values,
        param: { milestoneId: initialValues.$id },
      },
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
        <CardTitle className="text-xl font-bold">Edit milestone</CardTitle>
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
                    <FormLabel>Milestone Name</FormLabel>
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
                Update Milestone
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
