import React from 'react';
import { usePerformance } from '@/contexts/PerformanceContext';

interface PerformanceTrackedComponentProps {
  children: React.ReactNode;
  componentName: string;
  trackInteractions?: boolean;
}

const PerformanceTrackedComponent: React.FC<PerformanceTrackedComponentProps> = ({
  children,
  componentName,
  trackInteractions = true
}) => {
  const { startRenderTracking, endRenderTracking, trackUserInteraction } = usePerformance();

  React.useEffect(() => {
    startRenderTracking();
    return () => {
      endRenderTracking(componentName);
    };
  }, [componentName, startRenderTracking, endRenderTracking]);

  const handleClick = React.useCallback((event: React.MouseEvent) => {
    if (trackInteractions) {
      trackUserInteraction(`click:${componentName}`);
    }
    // Continue with original click event
    const originalOnClick = (event.target as any)?.onclick;
    if (originalOnClick) {
      originalOnClick(event);
    }
  }, [trackInteractions, trackUserInteraction, componentName]);

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
};

export default PerformanceTrackedComponent;