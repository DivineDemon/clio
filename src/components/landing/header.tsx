"use client";

import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import { useState } from "react";
import SampleOne from "@/assets/img/sample-one.svg";
import { SAMPLE_TWO } from "@/lib/constants";
import { Switch } from "../ui/switch";

const Header = () => {
  const [render, setRender] = useState<boolean>(false);

  return (
    <header className="mx-auto flex h-screen w-full max-w-screen-lg flex-col items-center justify-end">
      <div className="relative h-[600px] w-full overflow-hidden rounded-t-2xl">
        <div className="absolute top-5 right-5 flex items-center justify-center gap-2.5">
          <span className="mt-0.5 text-[14px] text-secondary leading-[14px]">View {render ? "Code" : "Render"}</span>
          <Switch checked={render} onCheckedChange={setRender} />
        </div>
        {render ? (
          <div data-color-mode="dark">
            <MDEditor.Markdown
              source={SAMPLE_TWO}
              style={{
                backgroundColor: "#011627",
                padding: "20px",
                borderRadius: "5px",
              }}
            />
          </div>
        ) : (
          <Image
            src={SampleOne}
            alt="sample-one"
            width={1000}
            height={1000}
            className="h-full w-full object-cover object-top"
          />
        )}
      </div>
    </header>
  );
};

export default Header;
