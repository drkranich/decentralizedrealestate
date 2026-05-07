import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { BrandProvider } from "@/components/brand/BrandProvider";
import { defaultBrand } from "@/config/brand";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${defaultBrand.name} — ${defaultBrand.tagline}` },
      { name: "description", content: "Decentralized real estate platform for investing, hosting, and managing properties worldwide. Tokenized ownership, AI pricing, automated operations." },
      { property: "og:title", content: `${defaultBrand.name} — ${defaultBrand.tagline}` },
      { property: "og:description", content: "Decentralized real estate platform for investing, hosting, and managing properties worldwide. Tokenized ownership, AI pricing, automated operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "SERAVIE" },
      { property: "og:title", content: "SERAVIE" },
      { name: "twitter:title", content: "SERAVIE" },
      { name: "twitter:description", content: "Decentralized real estate platform for investing, hosting, and managing properties worldwide. Tokenized ownership, AI pricing, automated operations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d8dfaf10-2d8f-4010-b6b1-db583940ca4c/id-preview-ecd5ed80--a5a2fd30-0ea2-4942-bc45-ba2cb0f23b36.lovable.app-1778164513165.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d8dfaf10-2d8f-4010-b6b1-db583940ca4c/id-preview-ecd5ed80--a5a2fd30-0ea2-4942-bc45-ba2cb0f23b36.lovable.app-1778164513165.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      ...(defaultBrand.theme.typography.googleFontsHref
        ? [{ rel: "stylesheet", href: defaultBrand.theme.typography.googleFontsHref }]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <Outlet />
      </BrandProvider>
    </QueryClientProvider>
  );
}
