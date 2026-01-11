const { THRESHOLDS, EVENTS, TIMEOUTS } = require('../utils/constants');

class MonitorService {
    constructor(io) {
        this.io = io;
        this.currentVitals = { heart_rate: 0, spo2: 0, timestamp: null };
        this.alertState = { isCritical: false, lastAlertDetails: null };
        this.deviceTimer = null;
        this.history = []; // Keep a short history buffer
    }

    processVitals(data) {
        const { heart_rate, spo2 } = data;
        const timestamp = new Date();

        this.currentVitals = { heart_rate, spo2, timestamp };

        // Add to history (keep last 50 points)
        if (this.history.length > 50) this.history.shift();
        this.history.push(this.currentVitals);

        // Reset Disconnect Timer
        this.resetDeviceTimer();

        // Check Thresholds
        this.checkThresholds(heart_rate, spo2);

        // Broadcast update
        this.io.emit(EVENTS.VITALS_UPDATE, this.currentVitals);
    }

    checkThresholds(hr, spo2) {
        const isCritical = hr > THRESHOLDS.HEART_RATE_MAX || spo2 < THRESHOLDS.SPO2_MIN;

        if (isCritical && !this.alertState.isCritical) {
            // Transition to CRITICAL
            this.alertState.isCritical = true;
            this.alertState.lastAlertDetails = { hr, spo2, time: new Date() };

            this.io.emit(EVENTS.ALERT_TRIGGERED, {
                message: '⚠️ Patient vitals critical. Immediate attention required.',
                details: this.alertState.lastAlertDetails
            });
            console.log('CRITICAL ALERT TRIGGERED:', this.alertState.lastAlertDetails);

        } else if (!isCritical && this.alertState.isCritical) {
            // Transition back to NORMAL
            this.alertState.isCritical = false;
            this.alertState.lastAlertDetails = null;

            this.io.emit(EVENTS.ALERT_CLEARED, { message: 'Patient vitals returned to normal.' });
            console.log('ALERT CLEARED');
        }
    }

    resetDeviceTimer() {
        if (this.deviceTimer) clearTimeout(this.deviceTimer);

        this.deviceTimer = setTimeout(() => {
            this.handleDisconnect();
        }, TIMEOUTS.DEVICE_DISCONNECT_MS);
    }

    handleDisconnect() {
        console.log('DEVICE DISCONNECTED');
        this.io.emit(EVENTS.DEVICE_DISCONNECTED, { message: 'Device signal lost.' });

        // Optionally alert on disconnect?
        // For now, just a status update.
    }

    getHistory() {
        return this.history;
    }
}

module.exports = MonitorService;
