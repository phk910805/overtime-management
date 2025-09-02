export const timeUtils = {
  formatTime: (totalMinutes) => {
    if (!totalMinutes) return '0:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  },

  parseTimeToMinutes: (timeStr) => {
    if (!timeStr?.trim()) return 0;
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours || 0) * 60 + parseInt(minutes || 0);
  },

  convertTimeToMinutes: (hours, minutes) => {
    return parseInt(hours || 0) * 60 + parseInt(minutes || 0);
  }
};
