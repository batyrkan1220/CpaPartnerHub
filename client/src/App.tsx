import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import OffersPage from "@/pages/offers/index";
import CreateOfferPage from "@/pages/offers/create";
import PartnersPage from "@/pages/partners/index";
import AdvertisersPage from "@/pages/advertisers/index";
import StatisticsPage from "@/pages/statistics";
import PaymentsPage from "@/pages/payments";
import AntiFraudPage from "@/pages/anti-fraud";
import MotivationPage from "@/pages/motivation";
import MainLayout from "@/layouts/main-layout";
import { useUser } from "@/lib/auth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (!data?.user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard">
        <RequireAuth>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/offers">
        <RequireAuth>
          <MainLayout>
            <OffersPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/offers/create">
        <RequireAuth>
          <MainLayout>
            <CreateOfferPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/partners">
        <RequireAuth>
          <MainLayout>
            <PartnersPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/advertisers">
        <RequireAuth>
          <MainLayout>
            <AdvertisersPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/statistics">
        <RequireAuth>
          <MainLayout>
            <StatisticsPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/payments">
        <RequireAuth>
          <MainLayout>
            <PaymentsPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/anti-fraud">
        <RequireAuth>
          <MainLayout>
            <AntiFraudPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/motivation">
        <RequireAuth>
          <MainLayout>
            <MotivationPage />
          </MainLayout>
        </RequireAuth>
      </Route>
      
      <Route path="/">
        <RequireAuth>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </RequireAuth>
      </Route>
      
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
