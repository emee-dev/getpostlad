"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Code2, 
  FileCode, 
  TestTube, 
  Download, 
  Users, 
  Settings, 
  ChevronDown,
  ArrowRight,
  GitBranch,
  Play,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const faqItems = [
  {
    question: "How is Panda different from Bruno or Postman?",
    answer: "Panda uses plain JavaScript for request collections, integrates assertions with Chai, and is version-control friendly. No proprietary formats - just code that developers already understand."
  },
  {
    question: "Can I import my Postman collections?",
    answer: "Yes! Panda supports importing .json and .zip files from Postman v2+. Your existing collections will be automatically converted to JavaScript format."
  },
  {
    question: "What does the scripting experience look like?",
    answer: "You get a mini-IDE with syntax highlighting, pre/post hooks, and dynamic testing using ChaiJS. Write tests like you would in any JavaScript project."
  },
  {
    question: "Payment modal not working?",
    answer: "Try a hard reload (Ctrl + Shift + R) to clear cache and reload scripts. This usually resolves any issues with cached payment scripts."
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 transition-colors">
          <h3 className="font-semibold text-foreground">{question}</h3>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <p className="text-muted-foreground">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 rounded-md p-4 font-mono text-sm space-y-2">
      {children}
    </div>
  );
}

function MockAppInterface() {
  return (
    <div className="relative rounded-lg border bg-muted/50 p-1 shadow-2xl">
      <div className="rounded-md bg-background border overflow-hidden">
        {/* Mock browser header */}
        <div className="flex items-center space-x-2 px-4 py-3 bg-muted/30 border-b">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center text-sm text-muted-foreground">
            Panda HTTP - API Testing
          </div>
        </div>
        
        {/* Mock app interface */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <FileCode className="w-4 h-4 text-primary" />
            <span className="font-mono">user-api.js</span>
          </div>
          
          <CodeBlock>
            <div className="text-blue-600 dark:text-blue-400">const GET = () =&gt; &#123;</div>
            <div className="pl-4 space-y-1">
              <div><span className="text-green-600 dark:text-green-400">name:</span> <span className="text-orange-600 dark:text-orange-400">&quot;Get User Profile&quot;</span>,</div>
              <div><span className="text-green-600 dark:text-green-400">url:</span> <span className="text-orange-600 dark:text-orange-400">&quot;&#123;&#123;BASE_URL&#125;&#125;/users/&#123;&#123;USER_ID&#125;&#125;&quot;</span>,</div>
              <div><span className="text-green-600 dark:text-green-400">headers:</span> &#123;</div>
              <div className="pl-4"><span className="text-orange-600 dark:text-orange-400">&apos;Authorization&apos;</span>: <span className="text-orange-600 dark:text-orange-400">&apos;Bearer &#123;&#123;TOKEN&#125;&#125;&apos;</span></div>
              <div>&#125;</div>
            </div>
            <div className="text-blue-600 dark:text-blue-400">&#125;;</div>
          </CodeBlock>
          
          <div className="flex items-center justify-between">
            <Button size="sm" className="bg-primary">
              <Play className="w-3 h-3 mr-1" />
              Send Request
            </Button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>200 OK • 245ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">🐼</span>
            </div>
            <span className="font-bold text-xl">Panda HTTP</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/inspiration" className="text-sm font-medium hover:text-primary transition-colors">
              Inspiration
            </Link>
            <Link href="/http">
              <Button size="sm">Launch App</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Code2 className="w-3 h-3 mr-1" />
                  JavaScript-First API Testing
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Test HTTP APIs the{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    JavaScript Way
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  No .bru files. Just JavaScript. Assertions with Chai. Collections that live in code.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/http">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Play className="w-4 h-4 mr-2" />
                    Launch App
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <GitBranch className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No vendor lock-in</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Git-friendly</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Developer-first DX</span>
                </div>
              </div>
            </div>

            {/* Right Content - App Screenshot */}
            <div className="relative">
              <MockAppInterface />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built for JavaScript Developers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to test APIs, the way you already think about code.
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 - Write Collections in JS */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    <FileCode className="w-3 h-3 mr-1" />
                    Collections as Code
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Write Collections in JavaScript
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Collections are just JavaScript files — versionable, inspectable, and scriptable. 
                    No proprietary formats, no vendor lock-in. Just code that lives with your project.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>Git-friendly by design</span>
                </div>
              </div>
              
              <Card className="bg-background border-2">
                <CardContent className="p-6">
                  <CodeBlock>
                    <div className="text-purple-600 dark:text-purple-400">// users.js</div>
                    <div className="text-blue-600 dark:text-blue-400">const POST = () =&gt; &#123;</div>
                    <div className="pl-4 space-y-1">
                      <div><span className="text-green-600 dark:text-green-400">url:</span> <span className="text-orange-600 dark:text-orange-400">&quot;/api/users&quot;</span>,</div>
                      <div><span className="text-green-600 dark:text-green-400">json:</span> &#123;</div>
                      <div className="pl-4 space-y-1">
                        <div><span className="text-green-600 dark:text-green-400">name:</span> <span className="text-orange-600 dark:text-orange-400">&quot;John Doe&quot;</span>,</div>
                        <div><span className="text-green-600 dark:text-green-400">email:</span> <span className="text-orange-600 dark:text-orange-400">&quot;john@example.com&quot;</span></div>
                      </div>
                      <div>&#125;</div>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">&#125;;</div>
                  </CodeBlock>
                </CardContent>
              </Card>
            </div>

            {/* Feature 2 - Test with ChaiJS */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card className="bg-background border-2 lg:order-1">
                <CardContent className="p-6">
                  <CodeBlock>
                    <div className="text-blue-600 dark:text-blue-400">post_response: () =&gt; &#123;</div>
                    <div className="pl-4 space-y-1">
                      <div className="text-purple-600 dark:text-purple-400">describe(&apos;User API&apos;, () =&gt; &#123;</div>
                      <div className="pl-4 space-y-1">
                        <div className="text-blue-600 dark:text-blue-400">it(&apos;should return 201&apos;, () =&gt; &#123;</div>
                        <div className="pl-4"><span className="text-green-600 dark:text-green-400">expect</span>(res.getStatus())</div>
                        <div className="pl-8">.to.equal(<span className="text-orange-600 dark:text-orange-400">201</span>);</div>
                        <div className="text-blue-600 dark:text-blue-400">&#125;);</div>
                      </div>
                      <div className="text-purple-600 dark:text-purple-400">&#125;);</div>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">&#125;</div>
                  </CodeBlock>
                </CardContent>
              </Card>
              
              <div className="space-y-6 lg:order-2">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    <TestTube className="w-3 h-3 mr-1" />
                    Testing Built-in
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Test with ChaiJS
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Use familiar assertions to validate responses, status codes, and headers. 
                    Write tests the same way you do in your JavaScript projects.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>Familiar testing syntax</span>
                </div>
              </div>
            </div>

            {/* Feature 3 - Postman Compatibility */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    <Download className="w-3 h-3 mr-1" />
                    Import & Export
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Postman Compatibility
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Import Postman collections and export them as .zip files. 
                    Seamless migration from your existing workflow.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>Supports Postman v2+ collections</span>
                </div>
              </div>
              
              <Card className="bg-background border-2">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Import Collection</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Browse
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <div className="space-y-2">
                        <FileCode className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop your .json or .zip file here
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Supports Postman v2.1+ collections
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature 4 - Realtime with Convex */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card className="bg-background border-2 lg:order-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Live Collaboration</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">J</div>
                        <span>John updated user-api.js</span>
                        <span className="text-muted-foreground">2s ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">S</div>
                        <span>Sarah added new environment</span>
                        <span className="text-muted-foreground">1m ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6 lg:order-2">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    <Users className="w-3 h-3 mr-1" />
                    Real-time Sync
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Realtime with Convex
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Collaborate in real-time using Convex&apos;s serverless backend. 
                    Share collections, environments, and results instantly.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>Instant synchronization</span>
                </div>
              </div>
            </div>

            {/* Feature 5 - Environment Variables */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit">
                    <Settings className="w-3 h-3 mr-1" />
                    Environment Management
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    Environment Variables
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Just use <code className="bg-muted px-1 rounded">&#123;&#123;variableName&#125;&#125;</code>. 
                    Built-in environment variable support, just like Postman.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4" />
                  <span>Familiar &#123;&#123;variable&#125;&#125; syntax</span>
                </div>
              </div>
              
              <Card className="bg-background border-2">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Development Environment</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BASE_URL</span>
                        <span>https://api.dev.example.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">API_TOKEN</span>
                        <span>dev_token_123...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USER_ID</span>
                        <span>12345</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Panda HTTP.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to test APIs the JavaScript way?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join developers who are already using Panda HTTP for their API testing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/http">
                <Button size="lg" className="w-full sm:w-auto">
                  <Play className="w-4 h-4 mr-2" />
                  Launch App
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">🐼</span>
              </div>
              <span className="font-bold text-xl">Panda HTTP</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="https://discord.gg/BmvSwRXX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Join our Discord community</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Panda HTTP. Built for JavaScript developers, by JavaScript developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}