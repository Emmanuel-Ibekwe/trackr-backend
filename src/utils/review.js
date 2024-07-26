function getWeekBoundaries(date) {
  // Create a new Date object from the input date to avoid mutating the original date
  let inputDate = new Date(date);

  // Get the day of the week for the input date (0 - Sunday, 6 - Saturday)
  let dayOfWeek = inputDate.getDay();

  // Calculate the difference between the input date and the nearest Sunday
  let sundayDiff = dayOfWeek;

  // Calculate the difference between the input date and the nearest Saturday
  let saturdayDiff = 6 - dayOfWeek;

  // Calculate the date of the Sunday within the week
  let sundayDate = new Date(inputDate);
  sundayDate.setDate(inputDate.getDate() - sundayDiff);

  // Calculate the date of the Saturday within the week
  let saturdayDate = new Date(inputDate);
  saturdayDate.setDate(inputDate.getDate() + saturdayDiff);

  return {
    sunday: sundayDate,
    saturday: saturdayDate
  };
}

function computeAverageTime(times) {
  if (!times.length) return "00:00";

  // Convert "HH:MM" to minutes
  const toMinutes = time => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to "HH:MM"
  const toTimeString = minutes => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Sum all times in minutes
  const totalMinutes = times.reduce((sum, time) => sum + toMinutes(time), 0);

  // Calculate average in minutes
  const averageMinutes = totalMinutes / times.length;

  // Convert average minutes back to "HH:MM"
  return toTimeString(Math.round(averageMinutes));
}

function computeEarliestTime(times) {
  if (!times.length) return "00:00";

  // Convert "HH:MM" to minutes
  const toMinutes = time => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to "HH:MM"
  const toTimeString = minutes => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Find the earliest time in minutes
  const earliestMinutes = Math.min(...times.map(toMinutes));

  // Convert the earliest minutes back to "HH:MM"
  return toTimeString(earliestMinutes);
}

// export function computeAverageTime(times) {
//     if (!times.length) return "00:00";

//     // Convert "HH:MM" to minutes
//     const toMinutes = time => {
//       const [hours, minutes] = time.split(":").map(Number);
//       return hours * 60 + minutes;
//     };

//     // Convert minutes to "HH:MM"
//     const toTimeString = minutes => {
//       const hours = Math.floor(minutes / 60) % 24;
//       const mins = minutes % 60;
//       return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
//     };

//     // Sum all times in minutes
//     const totalMinutes = times.reduce((sum, time) => sum + toMinutes(time), 0);

//     // Calculate average in minutes
//     const averageMinutes = totalMinutes / times.length;

//     // Convert average minutes back to "HH:MM"
//     return toTimeString(Math.round(averageMinutes));
//   }

function computeLatestTime(times) {
  if (!times.length) return "00:00";

  // Convert "HH:MM" to minutes
  const toMinutes = time => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to "HH:MM"
  const toTimeString = minutes => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Find the earliest time in minutes
  const earliestMinutes = Math.max(...times.map(toMinutes));

  // Convert the earliest minutes back to "HH:MM"
  return toTimeString(earliestMinutes);
}

function computeTimeScores(times, idealTime, maxTime) {
  // Convert "HH:MM" to minutes
  const toMinutes = time => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to "HH:MM"
  const toTimeString = minutes => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Calculate scores
  const idealMinutes = toMinutes(idealTime);
  const maxMinutes = toMinutes(maxTime);

  return times.map(time => {
    const timeMinutes = toMinutes(time);

    if (timeMinutes <= idealMinutes) {
      return 100;
    } else if (timeMinutes >= maxMinutes) {
      return 0;
    } else {
      // Calculate the score between ideal and max time
      const score =
        100 -
        ((timeMinutes - idealMinutes) / (maxMinutes - idealMinutes)) * 100;
      return Math.round(score);
    }
  });
}

function getMonthBoundaries(date) {
  // Create a new Date object from the input date to avoid mutating the original date
  let inputDate = new Date(date);

  // Get the year and month of the input date
  let year = inputDate.getFullYear();
  let month = inputDate.getMonth();

  // Calculate the first day of the month
  let firstDay = new Date(year, month, 1);

  // Calculate the last day of the month
  // Set the date to the first day of the next month and subtract one day
  let lastDay = new Date(year, month + 1, 0);

  return {
    firstDay: firstDay,
    lastDay: lastDay
  };
}

function isISODateString(dateString) {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  return isoRegex.test(dateString);
}

module.exports = {
  getWeekBoundaries,
  computeAverageTime,
  computeEarliestTime,
  computeLatestTime,
  computeTimeScores,
  getMonthBoundaries,
  isISODateString
};
