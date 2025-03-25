const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Fetch data from Wikipedia API
async function fetchWikipediaSummary(query) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        return response.data.extract || "I couldn't find relevant information on Wikipedia.";
    } catch (error) {
        return "Sorry, I couldn't fetch data from Wikipedia.";
    }
}

// Fetch data from DuckDuckGo API
async function fetchDuckDuckGoSearch(query) {
    try {
        const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        return response.data.Abstract || "I couldn't find relevant information on DuckDuckGo.";
    } catch (error) {
        return "Sorry, I couldn't fetch search results from DuckDuckGo.";
    }
}

// Fetch news from NewsAPI
async function fetchNews(query) {
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${process.env.NEWS_API_KEY}`);
        return response.data.articles.length > 0 ? response.data.articles[0].title : "No recent news found.";
    } catch (error) {
        return "Sorry, I couldn't fetch news updates.";
    }
}

// Fetch weather data from OpenWeather API
async function fetchWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
        return `Current temperature in ${city} is ${response.data.main.temp}°C with ${response.data.weather[0].description}.`;
    } catch (error) {
        return "Sorry, I couldn't fetch the weather details.";
    }
}

// Webhook Endpoint for Dialogflow
app.post('/webhook', async (req, res) => {
    console.log('Received request:', JSON.stringify(req.body, null, 2));
    
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    let responseText = '';

    switch (intentName) {
        case 'Default Welcome Intent':
            responseText = 'Welcome to FRIDAY! How can I assist you today?';
            break;
        case 'Default Fallback Intent':
            responseText = 'I didn’t quite get that. Could you rephrase?';
            break;
        case 'Wikipedia Search':
            responseText = await fetchWikipediaSummary(parameters.topic);
            break;
        case 'Web Search':
            responseText = await fetchDuckDuckGoSearch(parameters.query);
            break;
        case 'Latest News':
            responseText = await fetchNews(parameters.topic);
            break;
        case 'Weather Info':
            responseText = await fetchWeather(parameters.city);
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
