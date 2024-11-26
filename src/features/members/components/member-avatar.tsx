import Image from "next/image";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback  } from "@/components/ui/avatar";

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
};

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar className={cn("size-5 transition border border-neutral-500 rounded-full", className)}>
      <AvatarFallback className={cn(
        "bg-neutral-200 font-medium text-neutral-500 flex items-cente justify-center",
        fallbackClassName,
      )}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
