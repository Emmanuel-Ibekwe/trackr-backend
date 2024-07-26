function AreSameDates(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return true;
  } else {
    return false;
  }
}

function isDateLessThanOrEqual(date1, date2) {
  // Convert to Date objects if necessary
  if (!(date1 instanceof Date)) {
    date1 = new Date(date1);
  }
  if (!(date2 instanceof Date)) {
    date2 = new Date(date2);
  }

  return date1.getTime() <= date2.getTime();
}

module.exports = {
  AreSameDates,
  isDateLessThanOrEqual
};
