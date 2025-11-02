export function getDateOnly(date?: Date) {
  if (!date) {
    date = new Date();
  }

  date.setHours(date.getHours() - 3);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  return new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
}
