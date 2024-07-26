function getDayOfWeek(date) {
  // Create a new Date object
  const d = new Date(date);

  // Array of day names
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  // Get the day of the week (0-6)
  const dayIndex = d.getDay();

  // Return the day name
  return daysOfWeek[dayIndex];
}

module.exports = {
  getDayOfWeek
};
