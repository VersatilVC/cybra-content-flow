
import { coverPageStyles } from './styles/coverPageStyles';
import { tocStyles } from './styles/tocStyles';
import { contentPageStyles } from './styles/contentPageStyles';
import { contentStyles } from './styles/contentStyles';

export const pdfStyles = {
  ...coverPageStyles,
  ...tocStyles,
  ...contentPageStyles,
  ...contentStyles,
};
