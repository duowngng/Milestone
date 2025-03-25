import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "../dotted-separator";
import { Navigation } from "./navigation";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/" className="flex flex-col items-center gap-y-2">
        <Image src="/logo.svg" alt="logo" width={100} height={50} />
        <span className="text-2xl font-bold uppercase bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent tracking-tighter">
          MILESTONE
        </span>
      </Link>
      <DottedSeparator className="my-4" />
      <Navigation />
    </aside>
  );
};
