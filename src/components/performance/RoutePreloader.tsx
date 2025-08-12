import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOptimizedQueries } from '@/hooks/useOptimizedQueries';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

const RoutePreloader = () => {
  const location = useLocation();
  const { user } = useOptimizedAuth();
  const { prefetchDashboardData, prefetchContentPages } = useOptimizedQueries();

  useEffect(() => {
    if (!user?.id) return;

    // Preload data based on current route
    switch (location.pathname) {
      case '/dashboard':
        prefetchContentPages(); // Preload other content pages when on dashboard
        break;
      case '/content-ideas':
      case '/content-briefs':
      case '/content-items':
        prefetchDashboardData(); // Preload dashboard when on content pages
        break;
    }
  }, [location.pathname, user?.id, prefetchDashboardData, prefetchContentPages]);

  // Add hover preloading for navigation links
  useEffect(() => {
    const handleLinkHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.includes(window.location.origin)) {
        const href = link.getAttribute('href');
        
        if (href === '/dashboard') {
          prefetchDashboardData();
        } else if (['/content-ideas', '/content-briefs', '/content-items'].includes(href || '')) {
          prefetchContentPages();
        }
      }
    };

    document.addEventListener('mouseover', handleLinkHover);
    return () => document.removeEventListener('mouseover', handleLinkHover);
  }, [prefetchDashboardData, prefetchContentPages]);

  return null; // This component doesn't render anything
};

export default RoutePreloader;