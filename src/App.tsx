
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ContentIdeas from "./pages/ContentIdeas";
import ContentBriefs from "./pages/ContentBriefs";
import ContentItems from "./pages/ContentItems";
import ContentItemView from "./pages/ContentItemView";
import ContentCalendar from "./pages/ContentCalendar";
import NotificationCenter from "./pages/NotificationCenter";
import KnowledgeBases from "./pages/KnowledgeBases";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Webhooks from "./pages/Webhooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/content-ideas" element={<ContentIdeas />} />
                    <Route path="/content-briefs" element={<ContentBriefs />} />
                    <Route path="/content-items" element={<ContentItems />} />
                    <Route path="/content-items/:id" element={<ContentItemView />} />
                    <Route path="/content-calendar" element={<ContentCalendar />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/knowledge-bases" element={<KnowledgeBases />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user-management" element={
                      <ProtectedRoute adminOnly={true}>
                        <UserManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/webhooks" element={
                      <ProtectedRoute adminOnly={true}>
                        <Webhooks />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
