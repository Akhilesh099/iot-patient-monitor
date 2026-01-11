const express = require('express');
const router = express.Router();

module.exports = (monitorService) => {

    // ESP32 posts data to this endpoint
    router.post('/vitals', (req, res) => {
        const data = req.body;

        // Basic Validation
        if (data.heart_rate === undefined || data.spo2 === undefined) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        monitorService.processVitals(data);
        res.status(200).json({ status: 'ok' });
    });

    // Mobile App / Frontend can fetch latest history
    router.get('/history', (req, res) => {
        res.json(monitorService.getHistory());
    });

    return router;
};
