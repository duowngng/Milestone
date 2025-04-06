"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [internalRange, setInternalRange] = React.useState<
    DateRange | undefined
  >(value);

  React.useEffect(() => {
    setInternalRange(value);
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            className
          )}
        >
          <CalendarIcon className="size-4 mr-2" />
          {internalRange?.from ? (
            internalRange.to ? (
              <>
                {format(internalRange.from, "PPP")} -{" "}
                {format(internalRange.to, "PPP")}
              </>
            ) : (
              format(internalRange.from, "PPP")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={internalRange?.from}
          selected={internalRange}
          onSelect={(range) => {
            const newRange = range?.from ? range : undefined;
            setInternalRange(newRange);
            onChange?.(newRange);
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
