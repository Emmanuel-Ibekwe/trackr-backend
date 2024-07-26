const createHttpError = require("http-errors");

const BooleanEntry = require("./../models/booleanEntry.js");
const NumberEntry = require("./../models/numberEntry.js");
const TimeEntry = require("./../models/timeEntry.js");
const MinutesEntry = require("./../models/minutesEntry.js");
const reviewUtils = require("./../utils/review.js");
const {
  computeEarliestTime,
  computeAverageTime,
  computeLatestTime,
  computeTimeScores
} = reviewUtils;

const getBooleanEntriesWeeklyReviewData = async (
  task,
  taskId,
  weekBoundaries
) => {
  const entries = await BooleanEntry.find({
    taskId,
    date: {
      $gte: new Date(weekBoundaries.sunday),
      $lte: new Date(weekBoundaries.saturday)
    }
  }).sort({
    date: 1
  });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const successDayEntries = entries.filter(el => !el.isBreakDay && el.value);
  const weeklyCummulative = successDayEntries.length;
  const idealCummalative = workDayEntries.length;

  return {
    firstDayOfWeek: weekBoundaries.sunday,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    weeklyAverage: null,
    lowestValue: null,
    highestValue: null,
    workDayEntries,
    weeklyCummulative,
    idealCummalative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getBooleanEntriesMonthlyReviewData = async (
  task,
  taskId,
  monthBoundaries
) => {
  const entries = await BooleanEntry.find({
    taskId,
    date: {
      $gte: new Date(monthBoundaries.firstDay),
      $lte: new Date(monthBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const successDayEntries = entries.filter(el => !el.isBreakDay && el.value);
  const monthlyCummulative = successDayEntries.length;
  const idealCummalative = workDayEntries.length;

  return {
    firstDayOfMonth: monthBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    monthlyAverage: null,
    lowestValue: null,
    highestValue: null,
    workDayEntries,
    monthlyCummulative,
    idealCummalative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getNumberEntriesWeeklyReviewData = async (
  task,
  taskId,
  weekBoundaries
) => {
  const entries = await NumberEntry.find({
    taskId,
    date: {
      $gte: new Date(weekBoundaries.sunday),
      $lte: new Date(weekBoundaries.saturday)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntriesNumbers = workDayEntries.map(el => el.value);
  const weeklyCummulative = workDayEntriesNumbers.reduce(
    (total, el) => total + el
  );
  const weeklyAverage = weeklyCummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDayEntriesNumbers);
  const highestValue = Math.max(...workDayEntriesNumbers);

  return {
    firstDayOfWeek: weekBoundaries.sunday,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    weeklyAverage,
    lowestValue,
    highestValue,
    workDayEntriesNumbers,
    workDayEntriesLength: workDayEntries.length,
    weeklyCummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getNumberEntriesMonthlyReviewData = async (
  task,
  taskId,
  monthBoundaries
) => {
  const entries = await NumberEntry.find({
    taskId,
    date: {
      $gte: new Date(monthBoundaries.firstDay),
      $lte: new Date(monthBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntriesNumbers = workDayEntries.map(el => el.value);
  const monthlyCummulative = workDayEntriesNumbers.reduce(
    (total, el) => total + el
  );
  const monthlyAverage = monthlyCummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDayEntriesNumbers);
  const highestValue = Math.max(...workDayEntriesNumbers);

  return {
    firstDayOfMonth: monthBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    monthlyAverage,
    lowestValue,
    highestValue,
    workDayEntriesLength: workDayEntries.length,
    workDayEntriesNumbers,
    monthlyCummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getMinutesEntriesWeeklyReviewData = async (
  task,
  taskId,
  weekBoundaries
) => {
  const entries = await MinutesEntry.find({
    taskId,
    date: {
      $gte: new Date(weekBoundaries.sunday),
      $lte: new Date(weekBoundaries.saturday)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const workDaysMinutes = workDayEntries.map(el => el.value);
  const weeklyCummulative = workDaysMinutes.reduce((total, el) => total + el);
  const weeklyAverage = weeklyCummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDaysMinutes);
  const highestValue = Math.max(...workDaysMinutes);

  return {
    firstDayOfWeek: weekBoundaries.sunday,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    weeklyAverage,
    lowestValue,
    highestValue,
    workDayEntries,
    weeklyCummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getMinutesEntriesMonthlyReviewData = async (
  task,
  taskId,
  monthBoundaries
) => {
  const entries = await MinutesEntry.find({
    taskId,
    date: {
      $gte: new Date(monthBoundaries.firstDay),
      $lte: new Date(monthBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries does not exist");
  }

  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const workDaysMinutes = workDayEntries.map(el => el.value);
  const monthlyCummulative = workDaysMinutes.reduce((total, el) => total + el);
  const monthlyAverage = monthlyCummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDaysMinutes);
  const highestValue = Math.max(...workDaysMinutes);

  return {
    firstDayOfMonth: monthBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    monthlyAverage,
    lowestValue,
    highestValue,
    workDayEntries,
    workDayEntriesLength: workDayEntries.length,
    monthlyCummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit
  };
};

const getTimeEntriesWeeklyReviewData = async (task, taskId, weekBoundaries) => {
  const entries = await TimeEntry.find({
    taskId,
    date: {
      $gte: new Date(weekBoundaries.sunday),
      $lte: new Date(weekBoundaries.saturday)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDaysTimes = workDayEntries.map(el => el.value);
  const weeklyAverage = computeAverageTime(workDaysTimes);
  const lowestValue = computeEarliestTime(workDaysTimes);
  const highestValue = computeLatestTime(workDaysTimes);
  const timeScores = computeTimeScores(
    workDaysTimes,
    task.idealValue,
    task.maxTime
  );

  const idealCummalativeScore = 100 * workDayEntries.length;
  const totalScore = timeScores.reduce((total, el) => total + el);
  const score = Math.round((totalScore / idealCummalativeScore) * 100);

  return {
    firstDayOfWeek: weekBoundaries.sunday,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    weeklyAverage,
    lowestValue,
    highestValue,
    workDayEntries,
    weeklyCummulative: null,
    idealCummulative: null,
    idealValue: task.idealValue,
    unit: task.unit,
    timeScores: timeScores,
    score
  };
};

const getTimeEntriesMonthlyReviewData = async (
  task,
  taskId,
  monthBoundaries
) => {
  const entries = await TimeEntry.find({
    taskId,
    date: {
      $gte: new Date(monthBoundaries.firstDay),
      $lte: new Date(monthBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries does not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDaysTimes = workDayEntries.map(el => el.value);
  const monthlyAverage = computeAverageTime(workDaysTimes);
  const lowestValue = computeEarliestTime(workDaysTimes);
  const highestValue = computeLatestTime(workDaysTimes);
  const timeScores = computeTimeScores(
    workDaysTimes,
    task.idealValue,
    task.maxTime
  );

  const idealCummalativeScore = 100 * workDayEntries.length;
  const totalScore = timeScores.reduce((total, el) => total + el);
  const score = Math.round((totalScore / idealCummalativeScore) * 100);

  return {
    firstDayOfMonth: monthBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    monthlyAverage,
    lowestValue,
    highestValue,
    workDayEntries,
    monthlyCummulative: null,
    idealCummulative: null,
    idealValue: task.idealValue,
    unit: task.unit,
    timeScores: timeScores,
    score
  };
};

module.exports = {
  getBooleanEntriesMonthlyReviewData,
  getBooleanEntriesWeeklyReviewData,
  getNumberEntriesWeeklyReviewData,
  getNumberEntriesMonthlyReviewData,
  getMinutesEntriesWeeklyReviewData,
  getMinutesEntriesMonthlyReviewData,
  getTimeEntriesWeeklyReviewData,
  getTimeEntriesMonthlyReviewData
};
/***
 * 
 * date: {
      $gte: new Date("2024-07-13T23:00:00.000Z"),
      $lte: new Date("2024-07-19T23:00:00.000Z")
    }


    {taskId: taskId, date: {$gte: new Date("2024-07-13T23:00:00.000Z"),$lte: new Date("2024-07-19T23:00:00.000Z")}}
 */
