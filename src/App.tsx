import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import KnowledgeBases from "./pages/KnowledgeBases";
import Chat from "./pages/Chat";
import ContentIdeas from "./pages/ContentIdeas";
import ContentItems from "./pages/ContentItems";
import ContentCalendar from "./pages/ContentCalendar";
import UserManagement from "./pages/UserManagement";
import Webhooks from "./pages/Webhooks";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ContentBriefs from "./pages/ContentBriefs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/knowledge-bases" element={
                <ProtectedRoute>
                  <AppLayout>
                    <KnowledgeBases />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Chat />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/ideas" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContentIdeas />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/briefs" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContentBriefs />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/content" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContentItems />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContentCalendar />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/webhooks" element={
                <ProtectedRoute adminOnly>
                  <AppLayout>
                    <Webhooks />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute adminOnly>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/index" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Index />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
