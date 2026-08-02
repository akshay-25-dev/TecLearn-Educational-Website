// Helper function to convert total seconds to a human-readable duration string (e.g., "2h 15m" or "5m 30s")
function convertSecondsToDuration(totalSeconds) {
  const secondsInt = parseInt(totalSeconds, 10) || 0;
  const hours = Math.floor(secondsInt / 3600);
  const minutes = Math.floor((secondsInt % 3600) / 60);
  const seconds = Math.floor((secondsInt % 3600) % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = {
  convertSecondsToDuration,
};
