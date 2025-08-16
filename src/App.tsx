import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OptimizedAuthProvider } from "@/contexts/OptimizedAuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import OptimizedProtectedRoute from "@/components/performance/OptimizedProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import RoutePreloader from "@/components/performance/RoutePreloader";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import { QueryCacheOptimizer } from "@/components/performance/QueryCacheOptimizer";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { useMemoryOptimizer } from "@/components/performance/MemoryOptimizer";

import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const OptimizedDashboard = lazy(() => import("./pages/OptimizedDashboard"));
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
const PRPitches = lazy(() => import("./pages/PRPitches"));
const Journalists = lazy(() => import("./pages/Journalists"));
const PressReleases = lazy(() => import("./pages/PressReleases"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { ProductionDashboard } from "@/components/ProductionDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes default
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppWithHooks() {
  useMemoryOptimizer();
  
  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheOptimizer>
        <PerformanceProvider>
          <OptimizedAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <RoutePreloader />
                  <PerformanceMonitor />
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-white">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-muted-foreground">Loading application...</p>
                    </div>
                  </div>
                }>
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Optimized Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="dashboard">
                      <AppLayout>
                        <OptimizedDashboard />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/knowledge-bases" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <KnowledgeBases />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <Chat />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-briefs" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <ContentBriefs />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-items" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <ContentItems />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/content-items/:id" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-item">
                      <AppLayout>
                        <ContentItemView />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/general-content" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <GeneralContent />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <NotificationCenter />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                
                {/* PR Management Routes */}
                <Route 
                  path="/pr-pitches" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <PRPitches />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/journalists" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <Journalists />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/press-releases" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <PressReleases />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/user-management" 
                  element={
                    <OptimizedProtectedRoute adminOnly fallbackSkeleton="content-list">
                      <AppLayout>
                        <UserManagement />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/feedback-management" 
                  element={
                    <OptimizedProtectedRoute fallbackSkeleton="content-list">
                      <AppLayout>
                        <FeedbackManagement />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/webhooks" 
                  element={
                    <OptimizedProtectedRoute adminOnly fallbackSkeleton="content-list">
                      <AppLayout>
                        <Webhooks />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <OptimizedProtectedRoute adminOnly fallbackSkeleton="content-list">
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/production-dashboard" 
                  element={
                    <OptimizedProtectedRoute adminOnly fallbackSkeleton="dashboard">
                      <AppLayout>
                        <ProductionDashboard />
                      </AppLayout>
                    </OptimizedProtectedRoute>
                  } 
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </OptimizedAuthProvider>
  </PerformanceProvider>
</QueryCacheOptimizer>
</QueryClientProvider>
  );
}

const App = () => <AppWithHooks />;

export default App;
