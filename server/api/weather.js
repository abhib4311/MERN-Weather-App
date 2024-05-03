const axios = require("axios");

const WEATHER = require("../models/Weather");

// Configuring the path to read the environment variable file, .env, to get the weather api key
require('dotenv').config({ path: "./../../../.env" });

const baseUrl = "http://api.openweathermap.org/data/2.5/weather";

class Weather {

    /**
     * Gets the weather data based on the city and which temp system to converge to (imperial/metric system)
     *
     * @param {string} city The city used to get the weather info from the weather api
     * @param {string} tempMetric This is either "imperial" (use Fahrenheit) or "metric" (use Celsius)
     * @return {JSON} The data response from the weather api call.
     */
    getWeatherData = async (city, tempMetric) => {

        /**
         * Use get api for "By city code" (https://openweathermap.org/current#city)
         * - The "us" query stands for "United States
         * - "process.env.WEATHER_KEY" is the api key that we get from the .env file
         * - "units" query can be either imperial (Fahrenheit) or metric (Celsius)
         */
        let url = `${baseUrl}?q=${city}&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;

        // Awaitable call to get the information from the weather api and then return the data.
        // TODO: Add error handling for this call
        return (await axios(url)).data;
    }

    /**
     * Saves the weather data using the city as the unique identifier
     * If it already exists, replace, if not, then add.
     *
     * @param {string} city The city used to identify the document to upsert
     * @param {string} data Weather data to save/update
     * @return {JSON} The data response from the weather api data.
     */
    saveWeatherDataToMongo = async (city, data) => {
        const filter = {
            city: city
        }

        const replace = {
            ...filter,
            ...data,
            data: Date.now()
        }
        await this.findOneReplace(filter, replace);
    }

    /**
     * Saves Weather data to MongoDb
     *
     * @param {string} city The city used as unique identifier to find the document from mongo
     * @return {JSON} The data response from the mongodb.
     */
    getWeatherDataFromMongo = async (city) => {
        return WEATHER.findOne({ city: city });
    }

    /**
     * If a document already exists with the filter, then replace, if not, add.
     *
     * @param {{city: string}} filter The filter is the city used as unique identifier to find the document from mongo
     * @return {JSON} The data response from the mongodb.
     */
    async findOneReplace(filter, replace) {
        await WEATHER.findOneAndReplace(filter, replace, { new: true, upsert: true });
    }
}

module.exports = Weather;