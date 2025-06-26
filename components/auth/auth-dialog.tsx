"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User, LogOut, Loader2, Copy } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function AuthenticatedContent() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-muted-foreground/20 size-7 hover:dark:bg-muted-foreground/15"
        >
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="p-3 bg-muted rounded-md">
              {user?.email || "No email"}
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UnauthenticatedContent() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");

  const demoCredentials = {
    email: "example@gmail.com",
    password: "example@gmail.com"
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signIn("password", { 
        email, 
        password, 
        flow: "signUp" 
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signIn("password", { 
        email, 
        password, 
        flow: "signIn" 
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoCredentials = async () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError("");

    // Small delay to show the fields being filled
    setTimeout(async () => {
      setIsLoading(true);
      
      try {
        await signIn("password", { 
          email: demoCredentials.email, 
          password: demoCredentials.password, 
          flow: activeTab === "signin" ? "signIn" : "signUp"
        });
        setOpen(false);
        resetForm();
      } catch (error) {
        setError(error instanceof Error ? error.message : `Demo ${activeTab === "signin" ? "sign in" : "sign up"} failed`);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
    setIsLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-muted-foreground/20 size-7 hover:dark:bg-muted-foreground/15"
        >
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Demo Credentials Preview */}
          <div className="mt-4 p-4 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Demo Credentials</h4>
              <Copy className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="text-muted-foreground">
                <span className="text-foreground">Email:</span> {demoCredentials.email}
              </div>
              <div className="text-muted-foreground">
                <span className="text-foreground">Password:</span> {demoCredentials.password}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 h-8 text-xs"
              onClick={handleUseDemoCredentials}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />
                  Processing...
                </>
              ) : (
                "Use Demo Credentials"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Signing Up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AuthLoadingContent() {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="hover:bg-muted-foreground/20 size-7 hover:dark:bg-muted-foreground/15"
      disabled
    >
      <Loader2 className="h-4 w-4 animate-spin" />
    </Button>
  );
}

export function AuthDialog() {
  return (
    <>
      <AuthLoading>
        <AuthLoadingContent />
      </AuthLoading>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedContent />
      </Unauthenticated>
    </>
  );
}