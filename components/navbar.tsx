"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">CodeEditor</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7">
            main
          </Button>
          <Button variant="outline" size="sm" className="h-7">
            main
          </Button>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <Button variant="outline" size="icon" className="h-7 w-7">
          <Github className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}