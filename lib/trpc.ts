import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    console.log('Using window location as base URL:', baseUrl);
    return baseUrl;
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
        console.log('tRPC React Request URL:', url);
        console.log('tRPC React Request method:', options?.method);
        console.log('tRPC React Request headers:', options?.headers);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Request timeout after 120s - aborting...');
            controller.abort();
          }, 120000);
          
          console.log('Sending fetch request...');
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          console.log('tRPC React Response received - status:', response.status);
          console.log('tRPC React Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC Error Response body:', text);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC React Fetch Error:', error);
          if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
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
        console.log('tRPC Vanilla Request URL:', url);
        console.log('tRPC Vanilla Request method:', options?.method);
        console.log('tRPC Vanilla Request headers:', options?.headers);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('Request timeout after 120s - aborting...');
            controller.abort();
          }, 120000);
          
          console.log('Sending fetch request...');
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          console.log('tRPC Vanilla Response received - status:', response.status);
          console.log('tRPC Vanilla Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const text = await response.text();
            console.error('tRPC Error Response body:', text);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC Vanilla Fetch Error:', error);
          if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
          throw error;
        }
      },
    }),
  ],
});
