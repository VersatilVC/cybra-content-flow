import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const KnowledgeBases = lazy(() => import("./pages/KnowledgeBases"));
const Chat = lazy(() => import("./pages/Chat"));
const ContentIdeas = lazy(() => import("./pages/ContentIdeas"));
const ContentBriefs = lazy(() => import("./pages/ContentBriefs"));
const ContentItems = lazy(() => import("./pages/ContentItems"));
const ContentItemView = lazy(() => import("./pages/ContentItemView"));
const GeneralContent = lazy(() => import("./pages/GeneralContent"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const Settings = lazy(() => import("./pages/Settings"));
const FeedbackManagement = lazy(() => import("./pages/FeedbackManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
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
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
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
                    <ProtectedRoute>
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
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
