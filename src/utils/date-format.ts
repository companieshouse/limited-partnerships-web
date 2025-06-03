export const formatDate = (date: string, translation: Record<string, any>): string => {
  const months: Record<string, string> = {
    "01": translation.months.january,
    "02": translation.months.february,
    "03": translation.months.march,
    "04": translation.months.april,
    "05": translation.months.may,
    "06": translation.months.june,
    "07": translation.months.july,
    "08": translation.months.august,
    "09": translation.months.september,
    "10": translation.months.october,
    "11": translation.months.november,
    "12": translation.months.december
  };

  const [year, month, day] = date.split("-");
  const dayFormated = day.startsWith("0") ? day.slice(1) : day;

  return `${dayFormated} ${months[month]} ${year}`;
};
