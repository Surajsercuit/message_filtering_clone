import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import Index from "./pages/Index.tsx";
import Chat from "./pages/Chat.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const NotificationSetup = () => {
  useNotifications();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationSetup />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/chat/:contactId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
