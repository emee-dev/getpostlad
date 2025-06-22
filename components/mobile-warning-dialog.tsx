"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor } from "lucide-react";

interface MobileWarningDialogProps {
  open: boolean;
  onContinue: () => void;
  onQuit: () => void;
}

export function MobileWarningDialog({ 
  open, 
  onContinue, 
  onQuit 
}: MobileWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md font-geist"
        // Prevent closing by clicking outside or pressing escape
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 bg-destructive rounded-full p-1">
                <span className="text-destructive-foreground text-xs font-bold">!</span>
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold">
            Mobile Device Detected
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            This app is not optimized for mobile screens. For the best experience, 
            please use a larger device like a tablet or desktop computer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center my-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <span>Recommended: 600px+ screen width</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={onContinue}
            variant="outline"
            className="w-full"
          >
            Continue Anyway
          </Button>
          <Button 
            onClick={onQuit}
            variant="default"
            className="w-full"
          >
            Quit
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            🐼 Panda works best on larger screens
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}