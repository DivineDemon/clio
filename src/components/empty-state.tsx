import { FileX } from "lucide-react";
import Image from "next/image";
import SpiderWeb from "@/assets/img/spider-web.svg";

const EmptyState = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <Image
        src={SpiderWeb}
        alt="Spider Web"
        className="-top-2 -right-2.5 absolute size-36 opacity-50"
        width={144}
        height={144}
      />
      <FileX className="size-36 text-primary-foreground" />
      <span className="mt-7.5 mb-3.5 font-bold text-[20px] text-primary leading-[20px]">Nothing but Spider Webs</span>
      <span className="text-center text-muted-foreground text-sm">
        No README files generated yet. Kick off a job to
        <br />
        see it happening here.
      </span>
      <Image
        src={SpiderWeb}
        alt="Spider Web"
        className="-bottom-2.5 -left-2 absolute size-36 rotate-180 opacity-50"
        width={144}
        height={144}
      />
    </div>
  );
};

export default EmptyState;
