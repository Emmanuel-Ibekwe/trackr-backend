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
  const idealCummulative = workDayEntries.length;
  let score = (weeklyCummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

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
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit,
    score
  };
};

const getBooleanEntriesCustomReviewData = async (
  task,
  taskId,
  dateBoundaries
) => {
  const entries = await BooleanEntry.find({
    taskId,
    date: {
      $gte: new Date(dateBoundaries.firstDay),
      $lte: new Date(dateBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const successDayEntries = entries.filter(el => !el.isBreakDay && el.value);
  const cummulative = successDayEntries.length;
  const idealCummulative = workDayEntries.length;
  let score = (cummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

  return {
    firstDayOfMonth: dateBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    averageValue: null,
    lowestValue: null,
    highestValue: null,
    workDayEntries,
    cummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit,
    score
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
  let score = (weeklyCummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

  return {
    firstDayOfWeek: weekBoundaries.sunday,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    weeklyAverage,
    lowestValue,
    highestValue,
    workDayEntriesNumbers,
    weeklyCummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit,
    score
  };
};

const getNumberEntriesCustomReviewData = async (
  task,
  taskId,
  dateBoundaries
) => {
  const entries = await NumberEntry.find({
    taskId,
    date: {
      $gte: new Date(dateBoundaries.firstDay),
      $lte: new Date(dateBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries do not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntriesNumbers = workDayEntries.map(el => el.value);
  const cummulative = workDayEntriesNumbers.reduce((total, el) => total + el);
  const averageValue = cummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDayEntriesNumbers);
  const highestValue = Math.max(...workDayEntriesNumbers);
  let score = (cummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

  return {
    firstDayOfMonth: dateBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    averageValue,
    lowestValue,
    highestValue,

    workDayEntriesNumbers,
    cummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit,
    score
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
  let score = (weeklyCummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

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
    unit: task.unit,
    score
  };
};

const getMinutesEntriesCustomReviewData = async (
  task,
  taskId,
  dateBoundaries
) => {
  const entries = await MinutesEntry.find({
    taskId,
    date: {
      $gte: new Date(dateBoundaries.firstDay),
      $lte: new Date(dateBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries does not exist");
  }

  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const workDaysMinutes = workDayEntries.map(el => el.value);
  const cummulative = workDaysMinutes.reduce((total, el) => total + el);
  const averageValue = cummulative / workDayEntries.length;
  const idealCummulative = task.idealValue * workDayEntries.length;
  const lowestValue = Math.min(...workDaysMinutes);
  const highestValue = Math.max(...workDaysMinutes);
  let score = (cummulative / idealCummulative) * 100;
  score = Number(score.toFixed(1));

  return {
    firstDayOfMonth: dateBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    averageValue,
    lowestValue,
    highestValue,
    workDayEntries,

    cummulative,
    idealCummulative,
    idealValue: task.idealValue,
    unit: task.unit,
    score
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

  const idealCummulativeScore = 100 * workDayEntries.length;
  const totalScore = timeScores.reduce((total, el) => total + el);
  let score = (totalScore / idealCummulativeScore) * 100;
  score = Number(score.toFixed(1));

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
    score
  };
};

const getTimeEntriesCustomReviewData = async (task, taskId, dateBoundaries) => {
  const entries = await TimeEntry.find({
    taskId,
    date: {
      $gte: new Date(dateBoundaries.firstDay),
      $lte: new Date(dateBoundaries.lastDay)
    }
  }).sort({ date: 1 });
  if (entries.length === 0) {
    throw createHttpError.NotFound("entries does not exist");
  }

  const workDayEntries = entries.filter(el => !el.isBreakDay);
  const breakDayEntries = entries.filter(el => el.isBreakDay);
  const workDaysTimes = workDayEntries.map(el => el.value);
  const averageValue = computeAverageTime(workDaysTimes);
  const lowestValue = computeEarliestTime(workDaysTimes);
  const highestValue = computeLatestTime(workDaysTimes);
  const timeScores = computeTimeScores(
    workDaysTimes,
    task.idealValue,
    task.maxTime
  );

  const idealCummulativeScore = 100 * workDayEntries.length;
  const totalScore = timeScores.reduce((total, el) => total + el);
  let score = (totalScore / idealCummulativeScore) * 100;
  score = Number(score.toFixed(1));

  return {
    firstDayOfMonth: dateBoundaries.firstDay,
    entries,
    breakDaysEntriesLength: breakDayEntries.length,
    breakDays: task.breakDays,
    averageValue,
    lowestValue,
    highestValue,
    workDayEntries,
    cummulative: null,
    idealCummulative: null,
    idealValue: task.idealValue,
    unit: task.unit,
    score
  };
};

module.exports = {
  getBooleanEntriesCustomReviewData,
  getBooleanEntriesWeeklyReviewData,
  getNumberEntriesWeeklyReviewData,
  getNumberEntriesCustomReviewData,
  getMinutesEntriesWeeklyReviewData,
  getMinutesEntriesCustomReviewData,
  getTimeEntriesWeeklyReviewData,
  getTimeEntriesCustomReviewData
};
/***
 * 
 * date: {
      $gte: new Date("2024-07-13T23:00:00.000Z"),
      $lte: new Date("2024-07-19T23:00:00.000Z")
    }


    {taskId: taskId, date: {$gte: new Date("2024-07-13T23:00:00.000Z"),$lte: new Date("2024-07-19T23:00:00.000Z")}}
 */
