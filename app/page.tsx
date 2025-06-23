"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
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
import Image from "next/image";
import { useState } from "react";

const images = {
  heroImage:
    "https://ri3guaa55l.ufs.sh/f/8gXsFydJfZdnGhNvhX0NQurmFy43DtCG0nvRe8WEjVJwSak2",
  collectionAsCodeImage:
    "https://ri3guaa55l.ufs.sh/f/8gXsFydJfZdnGhNvhX0NQurmFy43DtCG0nvRe8WEjVJwSak2",
  testsImage:
    "https://ri3guaa55l.ufs.sh/f/8gXsFydJfZdnfqy295BTxlMvbE97KuPfSqLpZaA4o0Us6nrh",
  testsResults:
    "https://ri3guaa55l.ufs.sh/f/8gXsFydJfZdnFzwX0HJs24j3hfwEQx1WV9SlkmJ0DdbtqR8X",
};

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
        <button className="flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors font-geist">
          <h3 className="font-semibold text-foreground">{question}</h3>
          <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <Separator className="my-2" />
      <CollapsibleContent className="px-4 pb-4">
        <p className="text-muted-foreground font-geist">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function MockAppInterface({ src }: { src: string }) {
  return (
    <div className="relative rounded-lg border bg-muted/50 p-1 shadow-2xl max-w-full overflow-hidden">
      <div className="rounded-md bg-background border overflow-hidden h-[300px] md:h-[400px]">
        <Image
          src={src}
          alt="Panda HTTP App Interface"
          width={800}
          height={600}
          className="w-full h-full object-contain"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Card className="bg-background border-2">
      <CardContent className="p-0">
        <div className="h-[150px] md:h-[250px] overflow-hidden rounded-md">
          <Image
            src={src}
            alt={alt}
            width={600}
            height={400}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-geist">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Image
              alt="app logo"
              width="32"
              height="32"
              src="https://basic-nightingale-232.convex.cloud/api/storage/516f470d-fbef-41e8-bd7b-0cd804b7e2c5"
              className="sm:w-10 sm:h-10"
              unoptimized
            />
            <span className="text-lg sm:text-xl font-bold font-poppins">Panda</span>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors font-geist">
              Pricing
            </Link>
            <Link href="/inspiration" className="text-sm font-medium hover:text-primary transition-colors font-geist hidden sm:inline">
              Inspiration
            </Link>
            <Link href="/http">
              <Button size="sm" className="font-geist">Launch App</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit font-geist">
                  <Code2 className="w-3 h-3 mr-1" />
                  JavaScript-First API Testing
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight font-poppins">
                  Test HTTP APIs the{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    JavaScript Way
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg font-geist">
                  No .bru files. Just JavaScript. Assertions with Chai. Collections that live in code.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/http" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto font-geist">
                    <Play className="w-4 h-4 mr-2" />
                    Launch App
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-geist">
                  <GitBranch className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-muted-foreground font-geist">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>No vendor lock-in</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Git-friendly</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Developer-first DX</span>
                </div>
              </div>
            </div>

            {/* Right Content - App Screenshot */}
            <div className="relative mt-8 lg:mt-0">
              <MockAppInterface src={images.heroImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-poppins">
              Built for JavaScript Developers
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-geist">
              Everything you need to test APIs, the way you already think about code.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-20">
            {/* Feature 1 - Write Collections in JS */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <FileCode className="w-3 h-3 mr-1" />
                    Collections as Code
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Write Collections in JavaScript
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    Collections are just JavaScript files — versionable, inspectable, and scriptable. 
                    No proprietary formats, no vendor lock-in. Just code that lives with your project.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Git-friendly by design</span>
                </div>
              </div>
              
              <ProductImage 
                src={images.collectionAsCodeImage} 
                alt="Collections as Code - JavaScript syntax highlighting"
              />
            </div>

            {/* Feature 2 - Test with ChaiJS */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <ProductImage 
                src={images.testsImage} 
                alt="Testing with ChaiJS - Assertion syntax"
              />
              
              <div className="space-y-4 sm:space-y-6 lg:order-2">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <TestTube className="w-3 h-3 mr-1" />
                    Tests
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Test with ChaiJS
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    Use familiar assertions to validate responses, status codes, and headers. 
                    Write tests the same way you do in your JavaScript projects.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Familiar testing syntax</span>
                </div>
              </div>
            </div>

            {/* Feature 3 - Test Results */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <TestTube className="w-3 h-3 mr-1" />
                    Testing
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Test Results
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    All assertions are evaluated and displayed in a meaningful manner. 
                    This allows you to easily validate REST API logic.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Clear test feedback</span>
                </div>
              </div>
              
              <ProductImage 
                src={images.testsResults} 
                alt="Test Results - Assertion results display"
              />
            </div>

            {/* Feature 4 - Postman Compatibility */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <Card className="bg-background border-2 lg:order-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium font-geist">Import Collection</span>
                      <Button size="sm" variant="outline" className="font-geist">
                        <Download className="w-3 h-3 mr-1" />
                        Browse
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center">
                      <div className="space-y-2">
                        <FileCode className="w-6 sm:w-8 h-6 sm:h-8 mx-auto text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground font-geist">
                          Drop your .json or .zip file here
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-geist">
                      Supports Postman v2.1+ collections
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4 sm:space-y-6 lg:order-2">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <Download className="w-3 h-3 mr-1" />
                    Import & Export
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Postman Compatibility
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    Import Postman collections and export them as .zip files. 
                    Seamless migration from your existing workflow.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Supports Postman v2+ collections</span>
                </div>
              </div>
            </div>

            {/* Feature 5 - Realtime with Convex */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <Card className="bg-background border-2 lg:order-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-sm font-medium font-geist">Live Collaboration</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">J</div>
                        <span className="font-geist truncate">John updated user-api.js</span>
                        <span className="text-muted-foreground font-geist flex-shrink-0">2s ago</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">S</div>
                        <span className="font-geist truncate">Sarah added new environment</span>
                        <span className="text-muted-foreground font-geist flex-shrink-0">1m ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4 sm:space-y-6 lg:order-2">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <Users className="w-3 h-3 mr-1" />
                    Real-time Sync
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Realtime with Convex
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    Collaborate in real-time using Convex&apos;s serverless backend. 
                    Share collections, environments, and results instantly.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Instant synchronization</span>
                </div>
              </div>
            </div>

            {/* Feature 6 - Environment Variables */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <Badge variant="outline" className="w-fit font-geist">
                    <Settings className="w-3 h-3 mr-1" />
                    Environment Management
                  </Badge>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins">
                    Environment Variables
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground font-geist">
                    Just use <code className="bg-muted px-1 rounded font-mono text-sm">&#123;&#123;variableName&#125;&#125;</code>. 
                    Built-in environment variable support, just like Postman.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground font-geist">
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  <span>Familiar &#123;&#123;variable&#125;&#125; syntax</span>
                </div>
              </div>
              
              <Card className="bg-background border-2">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium font-geist">Development Environment</span>
                      <Badge variant="secondary" className="font-geist">Active</Badge>
                    </div>
                    <div className="space-y-2 font-mono text-xs sm:text-sm overflow-x-auto">
                      <div className="flex justify-between min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">BASE_URL</span>
                        <span className="truncate ml-2">https://api.dev.example.com</span>
                      </div>
                      <div className="flex justify-between min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">API_TOKEN</span>
                        <span className="truncate ml-2">dev_token_123...</span>
                      </div>
                      <div className="flex justify-between min-w-0">
                        <span className="text-muted-foreground flex-shrink-0">USER_ID</span>
                        <span className="truncate ml-2">12345</span>
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
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 font-poppins">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-geist">
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
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-poppins">
              Ready to test APIs the JavaScript way?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-geist">
              Join developers who are already using Panda HTTP for their API testing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/http" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-geist">
                  <Play className="w-4 h-4 mr-2" />
                  Launch App
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-geist">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">🐼</span>
              </div>
              <span className="font-bold text-lg sm:text-xl font-poppins">Panda HTTP</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="https://discord.gg/BmvSwRXX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors font-geist"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span>Join our Discord community</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground font-geist">
            <p>&copy; 2025 Panda HTTP. Built for JavaScript developers, by JavaScript developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}