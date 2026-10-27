import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./Routing/AppRouter/AppRouter";
import { Toaster } from "react-hot-toast";
import CounterProvider from "./context/CounterContext/CounterContext";
import AuthContextProvider from "./context/CounterContext/AuthContext/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// console.log(import.meta.env);
const All = new QueryClient()
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={All}>


    <AuthContextProvider>
      <CounterProvider>
        <RouterProvider router={router} />
        <Toaster />
      </CounterProvider>
    </AuthContextProvider>  
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    {/* 👈 2. تغليف الـ RouterProvider بالـ CounterProvider */}
  </StrictMode>,
);
