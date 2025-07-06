import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

// Import pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import KnowledgeBases from "./pages/KnowledgeBases";
import Chat from "./pages/Chat";
import ContentIdeas from "./pages/ContentIdeas";
import ContentBriefs from "./pages/ContentBriefs";
import ContentItems from "./pages/ContentItems";
import ContentItemView from "./pages/ContentItemView";
import GeneralContent from "./pages/GeneralContent";
import NotificationCenter from "./pages/NotificationCenter";
import UserManagement from "./pages/UserManagement";
import Webhooks from "./pages/Webhooks";
import Settings from "./pages/Settings";
import FeedbackManagement from "./pages/FeedbackManagement";
import NotFound from "./pages/NotFound";
import { ProductionDashboard } from "@/components/ProductionDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/knowledge-bases" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <KnowledgeBases />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Chat />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/content-ideas" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ContentIdeas />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/content-briefs" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ContentBriefs />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/content-items" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ContentItems />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/content-items/:id" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ContentItemView />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/general-content" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GeneralContent />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <NotificationCenter />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/user-management" 
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout>
                      <UserManagement />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feedback-management" 
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout>
                      <FeedbackManagement />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/webhooks" 
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout>
                      <Webhooks />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/production-dashboard" 
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout>
                      <ProductionDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
