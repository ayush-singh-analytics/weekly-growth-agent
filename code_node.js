// Convert week number to actual Monday date
function weekToDate(weekNum) {
  const jan1 = new Date('2021-01-01');
  const dayOfWeek = jan1.getDay();
  const firstMonday = new Date(jan1);
  firstMonday.setDate(jan1.getDate() + (dayOfWeek === 0 ? 1 : 8 - dayOfWeek));
  const targetDate = new Date(firstMonday);
  targetDate.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
  return targetDate.toISOString().split('T')[0];
}

// Get all rows from BigQuery output
const rows = $input.all();

// Organise data by channel and week
const channelData = {};

for (const row of rows) {
  const channel = row.json.channel;
  const week = row.json.week_number;
  const purchases = row.json.total_purchases;

  if (!channelData[channel]) {
    channelData[channel] = {};
  }
  channelData[channel][week] = purchases;
}

// Detect week over week changes
const anomalies = [];
const summary = [];

for (const channel in channelData) {
  const weeks = Object.keys(channelData[channel]).sort((a, b) => a - b);

  for (let i = 1; i < weeks.length; i++) {
    const thisWeek = channelData[channel][weeks[i]];
    const lastWeek = channelData[channel][weeks[i - 1]];
    const change = thisWeek - lastWeek;
    const changePct = ((change / lastWeek) * 100).toFixed(1);

    summary.push({
      channel,
      week_start_date: weekToDate(parseInt(weeks[i])),
      week_number: parseInt(weeks[i]),
      purchases: thisWeek,
      prev_purchases: lastWeek,
      change,
      change_pct: parseFloat(changePct),
      generated_at: new Date().toISOString()
    });

    // Flag as anomaly if change is more than 20% in either direction
    if (Math.abs(changePct) > 20) {
      anomalies.push({
        channel,
        week_start_date: weekToDate(parseInt(weeks[i])),
        week_number: parseInt(weeks[i]),
        purchases: thisWeek,
        prev_purchases: lastWeek,
        change,
        change_pct: parseFloat(changePct),
        direction: change > 0 ? 'UP' : 'DOWN',
        generated_at: new Date().toISOString()
      });
    }
  }
}

return [{
  json: {
    summary,
    anomalies,
    anomaly_count: anomalies.length,
    generated_at: new Date().toISOString()
  }
}];
