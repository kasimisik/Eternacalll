import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@/components/ClerkProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import { ModernSignIn } from "@/pages/ModernSignIn";
import { ModernSignUp } from "@/pages/ModernSignUp";
import { SignInPage } from "@/components/ui/sign-in";
import { SignUpPage } from "@/components/ui/sign-up";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";
import Subscription from "@/pages/Subscription";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={ModernSignIn} />
      <Route path="/sign-up" component={ModernSignUp} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/subscription">
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ClerkProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground transition-colors">
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
