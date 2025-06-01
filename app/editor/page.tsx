"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./editor").then((e) => e.default), {
  ssr: false,
});

const Page = () => {
  return <Editor />;
};

export default Page;
