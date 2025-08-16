// Lazy imports for heavy dependencies to optimize bundle size

// DOMPurify lazy import
export const loadDOMPurify = async () => {
  const { default: DOMPurify } = await import('dompurify');
  return DOMPurify;
};

// JSZip lazy import
export const loadJSZip = async () => {
  const { default: JSZip } = await import('jszip');
  return JSZip;
};

// React PDF lazy import
export const loadReactPDF = async () => {
  const reactPDF = await import('@react-pdf/renderer');
  return reactPDF;
};

// PDF Template lazy import
export const loadPDFTemplate = async () => {
  const { default: ProfessionalPDFTemplate } = await import('@/components/content-item/ProfessionalPDFTemplate');
  return ProfessionalPDFTemplate;
};