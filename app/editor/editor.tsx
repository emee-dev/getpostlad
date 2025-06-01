"use client";

import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { RefObject, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// Features for cli integration for Postlad
// create a cli, add it to package.json bin property and use "pnpm link ." to install it to
// project root workspace all of this should be executed after project and webcontainer has initialized

const Page = () => {
  const webcontainerInstance = useRef<WebContainer>(null);

  async function startDevServer() {
    if (webcontainerInstance.current) {
      //   await webcontainerInstance.current.spawn("npm", ["run", "start"]);
      let execProcess = await webcontainerInstance.current.spawn("node", [
        "-v",
      ]);

      if (!execProcess) {
        console.log("Failed to execute script.");
        return;
      }

      execProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("Write:", data);
          },
        })
      );

      console.log("Running containers");
    } else {
      console.log("WebContainer was not loaded.");
    }

    // Wait for `server-ready` event
    // webcontainerInstance.current?.on("server-ready", (port, url) => {
    //   //   ?.src = url;
    //   if (iframeEl.current) {
    //     iframeEl.current.src = url;
    //   }
    // });
  }

  async function installDependencies() {
    // Install dependencies
    const installProcess = await webcontainerInstance.current?.spawn("npm", [
      "install",
    ]);

    if (!installProcess) return;

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    // Wait for install command to exit
    return installProcess.exit;
  }

  useEffect(() => {
    if (webcontainerInstance.current) return;

    async function init() {
      // Call only once

      if (!webcontainerInstance.current) {
        webcontainerInstance.current = await WebContainer.boot();
        await webcontainerInstance.current?.mount(files);
        console.log("WebContainer has loaded.");
      }

  
    }

    init();

    return () => webcontainerInstance.current?.teardown();
  }, []);
  
  return (
    <div id="app">
      <div className="container">
        <div className="editor">
          {/* <textarea ref={textareaEl} defaultValue="I am the default value">
            I am a textarea
          </textarea> */}
        </div>
        <div className="preview">
          {/* <iframe ref={iframeEl} src="loading.html"></iframe> */}
        </div>

        <Button onClick={() => startDevServer()}>Run node script</Button>
      </div>
    </div>
  );
};

export default Page;
