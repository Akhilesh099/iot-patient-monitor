module.exports = {
  THRESHOLDS: {
    HEART_RATE_MAX: 120, // BPM
    SPO2_MIN: 90         // Percentage
  },
  EVENTS: {
    VITALS_UPDATE: 'vitals_update',
    ALERT_TRIGGERED: 'alert_triggered',
    ALERT_CLEARED: 'alert_cleared',
    DEVICE_DISCONNECTED: 'device_disconnected'
  },
  TIMEOUTS: {
    DEVICE_DISCONNECT_MS: 5000 // 5 seconds without data = disconnected
  }
};
