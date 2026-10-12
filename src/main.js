const form = document.getElementById('weather-form');
const submitButton = document.getElementById('submit');
const resultSection = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const resultTemp = document.getElementById('result-temp');
const resultShort = document.getElementById('result-short');
const resultWind = document.getElementById('result-wind');
const resultDetail = document.getElementById('result-detail');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const zip = document.getElementById('zip').value.trim();

  submitButton.disabled = true;
  submitButton.textContent = 'Loading...';
  resultSection.classList.remove('hidden', 'success', 'failure');
  resultTitle.textContent = 'Fetching forecast...';
  resultTemp.textContent = '';
  resultShort.textContent = '';
  resultWind.textContent = '';
  resultDetail.textContent = '';

  try {
    const response = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}`);
    const data = await response.json();

    if (!response.ok) {
      resultSection.classList.add('failure');
      resultTitle.textContent = 'Could not get weather';
      resultDetail.textContent = data.error ?? 'Unknown error';
      return;
    }

    resultSection.classList.add('success');
    resultTitle.textContent = `${data.city}, ${data.state} — ${data.period}`;
    resultTemp.textContent = `${data.temperature}°${data.temperatureUnit}`;
    resultShort.textContent = data.shortForecast;
    resultWind.textContent = `Wind: ${data.windSpeed} ${data.windDirection}`;
    resultDetail.textContent = data.detailedForecast;
  } catch (err) {
    resultSection.classList.add('failure');
    resultTitle.textContent = 'Request failed';
    resultDetail.textContent = err.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Get weather';
  }
});
