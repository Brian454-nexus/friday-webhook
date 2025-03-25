const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Webhook Endpoint for Dialogflow
app.post('/webhook', (req, res) => {
    console.log('Received request:', JSON.stringify(req.body, null, 2));
    
    const intentName = req.body.queryResult.intent.displayName;
    let responseText = '';

    switch (intentName) {
        case 'Default Welcome Intent':
            responseText = 'Welcome to FRIDAY! How can I assist you today?';
            break;
        case 'Default Fallback Intent':
            responseText = 'I didn’t quite get that. Could you rephrase?';
            break;
        default:
            responseText = `You triggered intent: ${intentName}, but I need to be trained to respond.`;
    }

    res.json({
        fulfillmentText: responseText
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`FRIDAY Webhook Server is running on port ${PORT}`);
});
