import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log('tRPC React Request:', url);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Request timeout - aborting...');
            controller.abort();
          }, 120000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          console.log('tRPC React Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC Error Response:', text);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC React Fetch Error:', error);
          throw error;
        }
      },
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log('tRPC Vanilla Request:', url);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Request timeout - aborting...');
            controller.abort();
          }, 120000);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          console.log('tRPC Vanilla Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC Error Response:', text);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC Vanilla Fetch Error:', error);
          throw error;
        }
      },
    }),
  ],
});
