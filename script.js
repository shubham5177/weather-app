document.getElementById("searchBtn").addEventListener("click", function() {
    const city = document.getElementById("cityInput").value.trim();
    const apiKey = "02d4b3324b28f3ae9339a1f644e6c1ca";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                document.getElementById("weatherDetails").innerHTML = `<p>City not found!</p>`;
            } else {
                const weatherDetails = `
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Weather: ${data.weather[0].description}</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                `;
                document.getElementById("weatherDetails").innerHTML = weatherDetails;
            }
        })
        .catch(error => {
            document.getElementById("weatherDetails").innerHTML = `<p>Error fetching data!</p>`;
            console.error("Error:", error);
        });
});

navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const apiKey = "02d4b3324b28f3ae9339a1f644e6c1ca";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const weatherDetails = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;
            document.getElementById("weatherDetails").innerHTML = weatherDetails;
        })
        .catch(error => {
            document.getElementById("weatherDetails").innerHTML = `<p>Error fetching geolocation data!</p>`;
            console.error("Error:", error);
        });
});