
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
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/knowledge-bases" element={<KnowledgeBases />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/ideas" element={<ContentIdeas />} />
                          <Route path="/content" element={<ContentItems />} />
                          <Route path="/calendar" element={<ContentCalendar />} />
                          <Route 
                            path="/admin/users" 
                            element={
                              <ProtectedRoute adminOnly>
                                <UserManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/webhooks" 
                            element={
                              <ProtectedRoute adminOnly>
                                <Webhooks />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/settings" 
                            element={
                              <ProtectedRoute adminOnly>
                                <Settings />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/index" element={<Index />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
