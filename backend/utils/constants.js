module.exports = {
  THRESHOLDS: {
    HEART_RATE_MAX: 120, // BPM
    SPO2_MIN: 90         // Percentage
  },
  EVENTS: {
    VITALS_UPDATE: 'vitals_update',
    // Renamed to match strict user spec
    CRITICAL_ALERT: 'critical_alert',
    DEVICE_STATUS: 'device_status'
  },
  TIMEOUTS: {
    DEVICE_DISCONNECT_MS: 10000 // 10 seconds as per request
  }
};
