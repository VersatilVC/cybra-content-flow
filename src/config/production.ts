// Production environment configuration
// This file contains the production Supabase credentials and configuration

export const productionConfig = {
  supabase: {
    url: "https://agbcslwigqthrlxnqbmc.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTM2MTYsImV4cCI6MjA2NzM4OTYxNn0.9tciRjcOCMQNlVlkjdcASHRBQr4xmFvj_ypgbP3xgQU",
    serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYmNzbHdpZ3F0aHJseG5xYm1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgxMzYxNiwiZXhwIjoyMDY3Mzg5NjE2fQ.t1NeXZtuXEdCupG2CBfV6WgMoLE9GkANrIJJfSB8Cz0",
    functions: {
      baseUrl: "https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1",
      processContent: "https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/process-content",
      processIdeaCallback: "https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/process-idea-callback",
      wordpressPublish: "https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/wordpress-publish",
      healthCheck: "https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/health-check",
    },
    storage: {
      baseUrl: "https://agbcslwigqthrlxnqbmc.supabase.co/storage/v1/object",
      contentDerivatives: "https://agbcslwigqthrlxnqbmc.supabase.co/storage/v1/object/public/content-derivatives",
      knowledgeBaseFiles: "https://agbcslwigqthrlxnqbmc.supabase.co/storage/v1/object/public/knowledge-base-files",
      contentFiles: "https://agbcslwigqthrlxnqbmc.supabase.co/storage/v1/object/content-files",
    },
  },
  environment: "production" as const,
  projectId: "agbcslwigqthrlxnqbmc",
};