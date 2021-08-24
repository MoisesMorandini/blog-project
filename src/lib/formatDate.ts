import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(date: Date, formatValue: string = "dd MMM yyyy"): string {
  return format(
    date,
    formatValue,
    {
      locale: ptBR,
    }
  )
}