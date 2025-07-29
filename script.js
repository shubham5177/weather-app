const API_KEY = '5ae06bba0466e1a8b153b644f0a55568';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const elements = {
    cityInput: document.getElementById('cityInput'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    weatherCard: document.getElementById('weatherCard'),
    location: document.getElementById('location'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('description'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure')
};

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️'
};

function showLoading() {
    elements.loading.classList.add('show');
    elements.error.classList.remove('show');
    elements.weatherCard.classList.remove('show');
}

function hideLoading() {
    elements.loading.classList.remove('show');
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.classList.add('show');
    hideLoading();
}

function displayWeather(data) {
    const {
        name,
        sys,
        main,
        weather,
        wind
    } = data;

    elements.location.textContent = `${name}, ${sys.country}`;
    elements.weatherIcon.textContent = weatherIcons[weather[0].icon] || '🌤️';
    elements.temperature.textContent = `${Math.round(main.temp)}°C`;
    elements.description.textContent = weather[0].description;
    elements.feelsLike.textContent = `${Math.round(main.feels_like)}°C`;
    elements.humidity.textContent = `${main.humidity}%`;
    elements.windSpeed.textContent = `${Math.round(wind.speed * 3.6)} km/h`;
    elements.pressure.textContent = `${main.pressure} hPa`;

    hideLoading();
    elements.error.classList.remove('show');
    elements.weatherCard.classList.add('show');
}

async function fetchWeather(url) {
    try {
        showLoading();
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

function searchWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    fetchWeather(url);
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const {
                latitude,
                longitude
            } = position.coords;
            const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
            fetchWeather(url);
        },
        (error) => {
            let message = 'Unable to get your location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location access denied by user';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out';
                    break;
            }
            showError(message);
        }
    );
}

// Enter key support for search
elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Auto-focus on input
elements.cityInput.focus();

// Auto-detect live location on page load
window.addEventListener('load', () => {
    // Try to get user's current location first
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const {
                    latitude,
                    longitude
                } = position.coords;
                const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                fetchWeather(url);
            },
            (error) => {
                // If location access fails, fallback to New York
                console.log('Location access failed, using default city');
                elements.cityInput.value = 'New York';
                searchWeather();
            }, {
                timeout: 10000, // 10 second timeout
                enableHighAccuracy: true
            }
        );
    } else {
        // If geolocation not supported, fallback to New York
        elements.cityInput.value = 'New York';
        searchWeather();

    }
});
