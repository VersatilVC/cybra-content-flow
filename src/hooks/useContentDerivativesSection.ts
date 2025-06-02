
import { useState } from 'react';
import { useContentDerivatives } from './useContentDerivatives';

export function useContentDerivativesSection(contentItemId: string) {
  const { derivatives, isLoading } = useContentDerivatives(contentItemId);
  const [activeTab, setActiveTab] = useState('General');
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [generationCategory, setGenerationCategory] = useState<'General' | 'Social' | 'Ads'>('General');

  const categorizedDerivatives = {
    General: derivatives.filter(d => d.category === 'General'),
    Social: derivatives.filter(d => d.category === 'Social'),
    Ads: derivatives.filter(d => d.category === 'Ads')
  };

  const handleGenerate = (category: 'General' | 'Social' | 'Ads') => {
    setGenerationCategory(category);
    setIsGenerationModalOpen(true);
  };

  return {
    derivatives,
    isLoading,
    activeTab,
    setActiveTab,
    isGenerationModalOpen,
    setIsGenerationModalOpen,
    generationCategory,
    categorizedDerivatives,
    handleGenerate
  };
}
