import { useMemo } from 'react';
import { GeneralContentItem } from '@/types/generalContent';

export interface GroupedCarouselItem {
  submission_id: string;
  title: string;
  items: GeneralContentItem[];
  created_at: string;
  category: string;
  target_audience: string;
}

export const useGroupedCarouselContent = (items: GeneralContentItem[]): {
  carouselGroups: GroupedCarouselItem[];
  nonCarouselItems: GeneralContentItem[];
} => {
  return useMemo(() => {
    const carouselItems: GeneralContentItem[] = [];
    const nonCarouselItems: GeneralContentItem[] = [];

    // Separate carousel items from non-carousel items
    items.forEach(item => {
      if (item.derivative_type === 'image_carousel') {
        carouselItems.push(item);
      } else {
        nonCarouselItems.push(item);
      }
    });

    // Group carousel items by submission_id
    const groupedBySubmission = carouselItems.reduce((acc, item) => {
      const submissionId = item.submission_id || 'ungrouped';
      if (!acc[submissionId]) {
        acc[submissionId] = [];
      }
      acc[submissionId].push(item);
      return acc;
    }, {} as Record<string, GeneralContentItem[]>);

    // Convert grouped items to carousel groups
    const carouselGroups: GroupedCarouselItem[] = Object.entries(groupedBySubmission).map(([submissionId, groupItems]) => {
      // Sort items by created_at to maintain order
      const sortedItems = groupItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      return {
        submission_id: submissionId,
        title: `Image Carousel - ${sortedItems.length} slides`,
        items: sortedItems,
        created_at: sortedItems[0].created_at,
        category: sortedItems[0].category,
        target_audience: sortedItems[0].target_audience,
      };
    });

    // Sort carousel groups by creation date (newest first)
    carouselGroups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      carouselGroups,
      nonCarouselItems
    };
  }, [items]);
};