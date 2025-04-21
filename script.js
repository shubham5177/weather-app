// script.js

// ---------- FUNCTIONAL PROGRAMMING APPROACH ----------
// Pure functions for data transformations
const weatherDataTransformers = {
    // Format temperature for display
    formatTemperature: (temp) => `${Math.round(temp)}°C`,

    // Get weather icon based on condition
    getWeatherIcon: (condition) => {
        const icons = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'snow': '❄️',
            'thunderstorm': '⛈️',
            'drizzle': '🌦️',
            'mist': '🌫️'
        };
        return icons[condition.toLowerCase()] || '❓';
    },

    // Get crop recommendations based on weather and season
    getCropRecommendations: (weatherData, season) => {
        // Crop recommendations by season and temperature range
        const cropMatrix = {
            'spring': {
                cold: ['Peas', 'Spinach', 'Radish', 'Lettuce'],
                moderate: ['Carrots', 'Beets', 'Onions', 'Potatoes'],
                warm: ['Tomatoes', 'Peppers', 'Eggplant']
            },
            'summer': {
                moderate: ['Cucumbers', 'Beans', 'Corn'],
                warm: ['Melons', 'Squash', 'Okra'],
                hot: ['Sweet Potatoes', 'Peppers', 'Basil']
            },
            'fall': {
                cold: ['Kale', 'Brussels Sprouts', 'Turnips'],
                moderate: ['Cabbage', 'Broccoli', 'Cauliflower'],
                warm: ['Beans', 'Swiss Chard', 'Radishes']
            },
            'winter': {
                cold: ['Winter Wheat', 'Garlic', 'Cover Crops'],
                moderate: ['Onions', 'Peas', 'Spinach'],
                warm: ['Indoor Herbs', 'Microgreens', 'Sprouts']
            }
        };

        // Determine temperature range
        const temp = weatherData.main.temp;
        let tempRange = 'moderate';
        if (temp < 10) tempRange = 'cold';
        else if (temp > 25) tempRange = 'hot';
        else tempRange = 'moderate';

        return cropMatrix[season.toLowerCase()][tempRange] || [];
    }
};

// Helper function to determine current season
function determineCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

// Store for current app state
const appState = {
    weatherData: null,
    currentSeason: determineCurrentSeason(),
    cropRecommendations: []
};

// ---------- EVENT-DRIVEN PROGRAMMING APPROACH ----------
// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize season selector with current season
    const seasonSelector = document.getElementById('seasonSelector');
    seasonSelector.value = appState.currentSeason;

    // Set up event listeners
    document.getElementById('searchBtn').addEventListener('click', handleCitySearch);
    seasonSelector.addEventListener('change', handleSeasonChange);
    document.getElementById('calendarToggle').addEventListener('click', toggleFarmingCalendar);

    // Get user's location weather on initial load
    getUserLocationWeather();
});

// Handle city search button click
function handleCitySearch() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchWeatherData(city);
    }
}

// Handle season change in dropdown
function handleSeasonChange(event) {
    appState.currentSeason = event.target.value;

    // Update UI with new season
    updateFarmingCalendar(appState.currentSeason);

    // Update crop recommendations if we have weather data
    if (appState.weatherData) {
        updateCropRecommendations(appState.weatherData, appState.currentSeason);
    }
}

// Toggle farming calendar visibility
function toggleFarmingCalendar() {
    const calendarElement = document.getElementById('farmingCalendar');
    const toggleButton = document.getElementById('calendarToggle');

    if (calendarElement.classList.contains('hidden')) {
        calendarElement.classList.remove('hidden');
        toggleButton.textContent = 'Hide Farming Calendar';
    } else {
        calendarElement.classList.add('hidden');
        toggleButton.textContent = 'Show Farming Calendar';
    }
}

// ---------- API INTERACTION ----------
// Fetch weather data from OpenWeatherMap API
function fetchWeatherData(city) {
    const apiKey = "02d4b3324b28f3ae9339a1f644e6c1ca";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                document.getElementById('weatherDetails').innerHTML = `<p>City not found!</p>`;
                return;
            }

            // Store weather data
            appState.weatherData = data;

            // Update UI
            updateWeatherDisplay(data);
            updateCropRecommendations(data, appState.currentSeason);
            updateFarmingCalendar(appState.currentSeason);
        })
        .catch(error => {
            document.getElementById('weatherDetails').innerHTML = `<p>Error fetching data!</p>`;
            console.error("Error:", error);
        });
}

// Get weather for user's current location
function getUserLocationWeather() {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const apiKey = "02d4b3324b28f3ae9339a1f644e6c1ca";
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Store weather data
                appState.weatherData = data;

                // Update UI
                updateWeatherDisplay(data);
                updateCropRecommendations(data, appState.currentSeason);
                updateFarmingCalendar(appState.currentSeason);
            })
            .catch(error => {
                document.getElementById('weatherDetails').innerHTML = `<p>Error fetching geolocation data!</p>`;
                console.error("Error:", error);
            });
    }, error => {
        console.error("Geolocation error:", error);
        // Fall back to a default city
        fetchWeatherData("New York");
    });
}

// ---------- UI UPDATES ----------
// Update weather display with fetched data
function updateWeatherDisplay(data) {
    const icon = weatherDataTransformers.getWeatherIcon(data.weather[0].main);
    const temp = weatherDataTransformers.formatTemperature(data.main.temp);

    const weatherHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <div class="weather-icon">${icon}</div>
        <p class="temperature">${temp}</p>
        <p>${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
    `;

    document.getElementById('weatherDetails').innerHTML = weatherHTML;
}

// Update crop recommendations
function updateCropRecommendations(weatherData, season) {
    const crops = weatherDataTransformers.getCropRecommendations(weatherData, season);
    appState.cropRecommendations = crops;

    const cropsHTML = crops.length > 0 ?
        crops.map(crop => `<div class="crop-item">${crop}</div>`).join('') :
        '<p>No specific crop recommendations available for this season and weather.</p>';

    document.getElementById('cropRecommendations').innerHTML = cropsHTML;
}

// Update farming calendar
function updateFarmingCalendar(season) {
    const seasonInfo = {
        'spring': {
            dates: 'March 20 - June 20',
            activities: [
                'Prepare soil beds',
                'Start early vegetable seeds',
                'Plant cool-season crops',
                'Prune fruit trees'
            ]
        },
        'summer': {
            dates: 'June 21 - September 22',
            activities: [
                'Regular watering and maintenance',
                'Pest management',
                'Harvest early crops',
                'Plant late summer crops'
            ]
        },
        'fall': {
            dates: 'September 23 - December 21',
            activities: [
                'Harvest remaining summer crops',
                'Plant fall vegetables',
                'Prepare soil for winter',
                'Plant cover crops'
            ]
        },
        'winter': {
            dates: 'December 22 - March 19',
            activities: [
                'Plan next season\'s garden',
                'Order seeds',
                'Start indoor seedlings',
                'Maintain tools and equipment'
            ]
        }
    };

    const info = seasonInfo[season];

    const calendarHTML = `
        <h3>${season.charAt(0).toUpperCase() + season.slice(1)} Season</h3>
        <p><strong>Dates:</strong> ${info.dates}</p>
        <div class="calendar-activities">
            <h4>Recommended Activities:</h4>
            <ul>
                ${info.activities.map(activity => `<li>${activity}</li>`).join('')}
            </ul>
        </div>
    `;
    
    document.getElementById('farmingCalendar').innerHTML = calendarHTML;
}
