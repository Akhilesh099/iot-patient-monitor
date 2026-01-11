const { THRESHOLDS, EVENTS, TIMEOUTS } = require('../utils/constants');

class MonitorService {
    constructor(io) {
        this.io = io;
        this.currentVitals = { heart_rate: 0, spo2: 0, status: 'NORMAL', timestamp: null };
        this.alertState = { isCritical: false, lastAlertDetails: null };
        this.deviceTimer = null;
        this.history = []; // Keep a short history buffer
    }

    processVitals(data) {
        const { heart_rate, spo2 } = data;
        const timestamp = new Date();

        // Determine Status based on logic: HR > 120 or SpO2 < 90
        let status = 'NORMAL';
        if (heart_rate > THRESHOLDS.HEART_RATE_MAX || spo2 < THRESHOLDS.SPO2_MIN) {
            status = 'CRITICAL';
        }

        this.currentVitals = { heart_rate, spo2, status, timestamp };

        // Add to history (keep last 50 points)
        if (this.history.length > 50) this.history.shift();
        this.history.push(this.currentVitals);

        // Reset Disconnect Timer
        this.resetDeviceTimer();

        // Broadcast update with STATUS flag
        this.io.emit(EVENTS.VITALS_UPDATE, this.currentVitals);

        // Also Trigger Critical Alert Event if needed (for Popup)
        if (status === 'CRITICAL') {
            this.io.emit(EVENTS.CRITICAL_ALERT, {
                message: '⚠️ CRITICAL VITALS DETECTED',
                details: { hr: heart_rate, spo2, time: timestamp }
            });
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
        // Spec: emit device_status event as "DISCONNECTED"
        this.io.emit(EVENTS.DEVICE_STATUS, { status: 'DISCONNECTED' });
    }

    getHistory() {
        return this.history;
    }
}

module.exports = MonitorService;
