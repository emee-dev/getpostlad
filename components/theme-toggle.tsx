"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 hover:bg-muted-foreground/20 hover:dark:bg-muted-foreground/15"
        >
          <Sun className="h-4 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {theme === "light" && <Check className="w-4 mr-2" />}{" "}
          {theme !== "light" && <div className="w-4 mr-2" />} Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {theme === "dark" && <Check className="w-4 mr-2" />}
          {theme !== "dark" && <div className="w-4 mr-2" />} Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {theme === "system" && <Check className="w-4 mr-2" />}
          {theme !== "system" && <div className="w-4 mr-2" />} System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
