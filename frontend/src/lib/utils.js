import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const readingTimeLabel = (minutes) => {
  if (!minutes) return '';
  return `${minutes} min read`;
};
