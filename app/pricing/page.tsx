"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import {
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  Headphones,
  InfinityIcon,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

const features = {
  basic: [
    "All core features enabled",
    "HTTP request testing",
    "Environment variables",
    "Request history",
    "Collection management",
    "Import/Export collections",
    "Dark/Light theme",
    "Community support",
  ],
  standard: [
    "Everything in Basic",
    "Custom integrations",
    "Priority support",
    "Unlimited team members",
    "Dedicated account manager",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
};

const faqItems = [
  {
    question: "How is Panda different from Bruno or Postman?",
    answer:
      "Panda uses plain JavaScript to define request collections, making it instantly familiar to developers. There are no proprietary formats, just code that works with your existing version control system. Since it's JavaScript, you can leverage its vast ecosystem (e.g., minification tools). Instead of sharing large OpenAPI specs, you can simply distribute compressed `.zip` files with no duplicate requests or responses.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "The Basic plan doesn't require a credit card and gives you access to all core features. You can start using Panda immediately.",
  },
  {
    question: "Why isn't the payment modal working?",
    answer:
      "Due to limitations in the Bolt hackathon environment, the payment modal may fail to load. If that happens, open the app in a new tab and do a hard reload (Ctrl + Shift + R) to clear cached scripts. This usually fixes the issue.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string | ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg p-4 text-left">
          <h3 className="font-semibold text-foreground font-geist">
            {question}
          </h3>
          <ChevronDown
            className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <Separator className="mb-2" />
      <CollapsibleContent className="px-4 pb-4">
        <p className="text-muted-foreground font-geist">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function PricingPage() {
  const basicCheckout = useFreemiusCheckout({
    productId: 18397,
    planId: 30999,
    publicKey: "pk_9fddb7dfcef65b178625bf3a2fa4a",
    image:
      "https://basic-nightingale-232.convex.cloud/api/storage/516f470d-fbef-41e8-bd7b-0cd804b7e2c5",
  });

  const standardCheckout = useFreemiusCheckout({
    productId: 18397,
    planId: 31642,
    publicKey: "pk_9fddb7dfcef65b178625bf3a2fa4a",
    image:
      "https://basic-nightingale-232.convex.cloud/api/storage/516f470d-fbef-41e8-bd7b-0cd804b7e2c5",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              alt="app logo"
              width="40"
              height="40"
              src="https://basic-nightingale-232.convex.cloud/api/storage/516f470d-fbef-41e8-bd7b-0cd804b7e2c5"
            />
            <span className="text-xl font-bold">Panda</span>
          </Link>
          <Link href="/">
            <Button variant="ghost">← Back to App</Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-geist">
            Supercharge your API development with Panda. Choose the plan that
            fits your needs and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto font-geist">
          {/* Basic Plan */}
          <Card className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Basic Plan</CardTitle>
              <CardDescription className="text-base">
                Perfect for individuals building personal projects
              </CardDescription>
              <div className="flex items-center justify-center mt-6">
                <span className="text-4xl font-bold">$99</span>
                <div className="ml-2 text-left">
                  <div className="text-sm text-muted-foreground">
                    per user/year
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Billed annually
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  No credit card required
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.basic.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={basicCheckout.openCheckout}
              >
                Get Basic Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Standard Plan */}
          <Card className="relative border-2 border-primary hover:border-primary/80 transition-all duration-300 hover:shadow-xl font-geist">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Standard Plan
              </CardTitle>
              <CardDescription className="text-base">
                Ideal for startups & companies with integration needs
              </CardDescription>
              <div className="flex items-center justify-center mt-6">
                <span className="text-4xl font-bold">$15</span>
                <div className="ml-2 text-left">
                  <div className="text-sm text-muted-foreground">
                    per user/month
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <InfinityIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Unlimited users
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-sm text-primary font-medium">
                  Capped at $3,000/month
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.standard.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.length > 0 && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={standardCheckout.openCheckout}
              >
                Get Standard Plan
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center font-poppins">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Completely bootstrapped and community funded.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help when you need it with our dedicated support team
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for speed with instant response times
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2 font-geist">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-muted-foreground">
          <p>
            Join our community on{" "}
            <a
              href="https://discord.gg/BmvSwRXX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Discord
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
