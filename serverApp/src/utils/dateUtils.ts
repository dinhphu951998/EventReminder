import * as dateFormat from 'dateformat'

export const formatDate = (date: Date | number): string => {

  return dateFormat(date, 'yyyy-mm-dd') as string
}