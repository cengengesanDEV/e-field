const makeSchedule = (start, end) => {
  const schedule = [];
  for (let i = start; i <= end; i++) {
    schedule.push(i);
  }
  return schedule;
};

module.exports = makeSchedule;
