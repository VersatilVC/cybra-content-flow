
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Dashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge-bases"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <KnowledgeBases />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Chat />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ideas"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <ContentIdeas />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <ContentItems />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <ContentCalendar />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <UserManagement />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/webhooks"
              element={
                <ProtectedRoute adminOnly>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Webhooks />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute adminOnly>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Settings />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/index"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Index />
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
