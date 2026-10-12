import express from 'express';

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.', { index: 'index.html' }));

const USER_AGENT = 'sample-node-app-weather-demo (contact: local-test)';

app.get('/api/weather', async (req, res) => {
  const zip = typeof req.query.zip === 'string' ? req.query.zip.trim() : '';

  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'zip must be a 5-digit US zip code' });
  }

  try {
    const geoResponse = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!geoResponse.ok) {
      return res.status(404).json({ error: `Could not find location for zip code ${zip}` });
    }
    const geo = await geoResponse.json();
    const place = geo.places?.[0];
    if (!place) {
      return res.status(404).json({ error: `Could not find location for zip code ${zip}` });
    }

    const lat = place.latitude;
    const lon = place.longitude;

    const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!pointsResponse.ok) {
      return res.status(502).json({ error: 'Failed to look up forecast grid from National Weather Service' });
    }
    const points = await pointsResponse.json();
    const forecastUrl = points.properties?.forecast;
    if (!forecastUrl) {
      return res.status(502).json({ error: 'National Weather Service did not return a forecast URL' });
    }

    const forecastResponse = await fetch(forecastUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!forecastResponse.ok) {
      return res.status(502).json({ error: 'Failed to fetch forecast from National Weather Service' });
    }
    const forecast = await forecastResponse.json();
    const current = forecast.properties?.periods?.[0];
    if (!current) {
      return res.status(502).json({ error: 'National Weather Service returned no forecast periods' });
    }

    res.json({
      zip,
      city: place['place name'],
      state: place['state abbreviation'],
      period: current.name,
      temperature: current.temperature,
      temperatureUnit: current.temperatureUnit,
      shortForecast: current.shortForecast,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      detailedForecast: current.detailedForecast,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
});
