import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const locale = {
  locale: ptBR,
};

export const formatDateToView = (date: string): string => {
  const stringToDate = new Date(date);
  return format(stringToDate, `dd LLL Y`, locale);
};

export const getReadingTime = (text: string): string => {
  const sanitizeText = text.replace(/,?\s+/g, ' ');
  const chunks = sanitizeText.split(' ');
  const time = Math.round(chunks.length / 150);

  return `${time} min`;
};
