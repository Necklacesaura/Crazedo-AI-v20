import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";

const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Contact = lazy(() => import("@/pages/contact"));

function LazyPage({ component: Component }: { component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/privacy">{() => <LazyPage component={Privacy} />}</Route>
          <Route path="/terms">{() => <LazyPage component={Terms} />}</Route>
          <Route path="/contact">{() => <LazyPage component={Contact} />}</Route>
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/privacy">{() => <LazyPage component={Privacy} />}</Route>
          <Route path="/terms">{() => <LazyPage component={Terms} />}</Route>
          <Route path="/contact">{() => <LazyPage component={Contact} />}</Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
