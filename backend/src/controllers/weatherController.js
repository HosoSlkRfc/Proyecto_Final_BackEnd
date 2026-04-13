const axios = require('axios');

const getWeather = async (req, res, next) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city   = process.env.WEATHER_CITY || 'Mexico City';


    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.json({
        success: false,
        message: 'API key de clima no configurada. Edita el archivo .env.',
        data: { temp: null, description: 'Sin datos', city, icon: null }
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather`
      + `?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;

    const { data } = await axios.get(url, { timeout: 5000 });

    res.json({
      success: true,
      data: {
        city:        data.name,
        country:     data.sys.country,
        temp:        Math.round(data.main.temp),
        feels_like:  Math.round(data.main.feels_like),
        humidity:    data.main.humidity,
        description: data.weather[0].description,
        icon:        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      }
    });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.json({
        success: false,
        message: 'API key de clima inválida.',
        data: { temp: null, description: 'Key inválida', city: process.env.WEATHER_CITY || '', icon: null }
      });
    }
    if (err.response?.status === 404) {
      return res.json({
        success: false,
        message: `Ciudad "${process.env.WEATHER_CITY}" no encontrada.`,
        data: { temp: null, description: 'Ciudad no encontrada', city: process.env.WEATHER_CITY || '', icon: null }
      });
    }
    next(err);
  }
};

module.exports = { getWeather };
