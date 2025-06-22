import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { ConvexClientProvider } from "@/provider";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Fira_Code, Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const fira_code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Panda - Postman/Bruno alternative",
  description: "Panda offers a clean, intuitive interface for developers who want API collections to live alongside their code. no vendor lock-in, seamless, developer-first DX.",
  metadataBase: new URL("https://majestic-sprite-a0bf86.netlify.app"),
  openGraph: {
    type: "website",
    url: "https://majestic-sprite-a0bf86.netlify.app/",
    title: "Panda - Postman/Bruno alternative",
    description: "Panda offers a clean, intuitive interface for developers who want API collections to live alongside their code. no vendor lock-in, seamless, developer-first DX.",
    images: [
      {
        url: "https://basic-nightingale-232.convex.cloud/api/storage/2f8c8c09-0ae3-4aa4-b4e9-bc00dfbb37ef",
        width: 1200,
        height: 630,
        alt: "Panda - Modern API Testing Tool",
      },
    ],
    siteName: "Panda",
  },
  twitter: {
    card: "summary_large_image",
    site: "@panda_dev", // Add your Twitter handle if you have one
    creator: "@panda_dev", // Add your Twitter handle if you have one
    title: "Panda - Postman/Bruno alternative",
    description: "Panda offers a clean, intuitive interface for developers who want API collections to live alongside their code. no vendor lock-in, seamless, developer-first DX.",
    images: [
      {
        url: "https://basic-nightingale-232.convex.cloud/api/storage/2f8c8c09-0ae3-4aa4-b4e9-bc00dfbb37ef",
        width: 1200,
        height: 630,
        alt: "Panda - Modern API Testing Tool",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes if you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://majestic-sprite-a0bf86.netlify.app",
  },
  keywords: [
    "API testing",
    "Postman alternative",
    "Bruno alternative",
    "REST API",
    "HTTP client",
    "API development",
    "Git-friendly",
    "JavaScript",
    "Developer tools",
    "API collections",
    "Open source",
  ],
  authors: [
    {
      name: "Panda Team",
      url: "https://majestic-sprite-a0bf86.netlify.app",
    },
  ],
  creator: "Panda Team",
  publisher: "Panda",
  category: "Developer Tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${fira_code.variable} ${GeistSans.variable}  bg-background antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}