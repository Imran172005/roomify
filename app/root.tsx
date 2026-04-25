import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import type { AuthState } from "../types";
import { useEffect, useState } from "react";
import {
  signIn as puterSignIn,
  signOut as puterSignOut,
} from "../lib/puter.action";
import type { Puter } from "@heyputer/puter.js";

// puter is attached to window by the Puter SDK script
declare const puter: Puter;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const DEFAULT_AUTH_STATE: AuthState = {
  isSignedIn: false,
  userName: null,
  userId: null,
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const refreshAuth = async () => {
    try {
      // Check if puter is available on window first
      if (typeof window !== 'undefined' && !(window as any).puter) {
        console.log("Puter SDK not loaded yet");
        setAuthState(DEFAULT_AUTH_STATE);
        return false;
      }
      
      const user = await puter.auth.getUser();

      const isSignedIn = Boolean(user);

      setAuthState({
        isSignedIn,
        userName: isSignedIn ? user.username : null,
        userId: isSignedIn ? user.uuid : null,
      });

      return isSignedIn;
    } catch (error: any) {
      // Don't treat "not enough funding" as a critical error
      if (error?.message?.includes('funding') || error?.message?.includes('balance')) {
        console.warn("Puter account has no funding - some features limited");
      } else {
        console.warn("Auth refresh failed:", error);
      }
      
      setAuthState(DEFAULT_AUTH_STATE);
      return false;
    }
  };

  useEffect(() => {
    refreshAuth();
  },[]);

  const signIn = async () => {
    try {
      await puterSignIn();
      return await refreshAuth();
    } catch (error: any) {
      if (error?.message?.includes('funding') || error?.message?.includes('balance')) {
        console.warn("Puter account has no funding for this operation");
      }
      return false;
    }
  }
  const signOut = async () => {
    try {
      await puterSignOut();
      return await refreshAuth();
    } catch (error) {
      console.warn("Sign out failed:", error);
      return false;
    }
  }
  return(
  <main className="min-h-screen bg-background text-foreground relative z-10">
    <Outlet
        context={{ ...authState, refreshAuth,signIn,signOut}}
    />;
  </main>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
