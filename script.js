document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded. Ready to fetch initial weather data.');
});

function fetchTimeZone(timeZoneName, callback) {
    const apiKey = '3fe5304b3d8f46aba3e977b933d74468';
    const url = `https://api.ipgeolocation.io/timezone?apiKey=${apiKey}&tz=${timeZoneName}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.timezone) {
                callback(data);
            } else {
                console.error("Time zone data is not available.");
            }
        })
        .catch(error => {
            console.error("Error fetching time zone:", error);
        });
}

let timeUpdateInterval;

function getWeatherForAddress() {
    console.log('Getting weather for address...');
    const address = document.getElementById('addressInput').value;
    console.log(`Getting weather for address: ${address}`);

    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }

    geocodeAddress(address, (coords) => {
        fetchTimeZoneByCoords(coords.latitude, coords.longitude, (timeZoneData) => {
            console.log('Time Zone Data:', timeZoneData);

            timeUpdateInterval = setInterval(() => displayCurrentTime(timeZoneData), 1000);

            fetchCurrentWeather(coords.latitude, coords.longitude);
            fetchWeatherForecast(coords.latitude, coords.longitude);
        });
    });
}

function fetchTimeZoneByCoords(latitude, longitude, callback) {
    const apiKey = '3fe5304b3d8f46aba3e977b933d74468';
    const url = `https://api.ipgeolocation.io/timezone?apiKey=${apiKey}&lat=${latitude}&long=${longitude}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(data && data.timezone) {
                callback(data);
            } else {
                console.error("Time zone data is not available.");
            }
        })
        .catch(error => {
            console.error("Error fetching time zone:", error);
        });
}

function geocodeAddress(address, callback) {
    console.log(`Geocoding address: ${address}`);
    const encodedAddress = encodeURIComponent(address);
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedAddress}&count=1&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data && data.results && data.results.length > 0) {
                console.log(`Geocoding result for ${address}:`, data.results[0]);
                const coords = {
                    latitude: data.results[0].latitude,
                    longitude: data.results[0].longitude
                };
                callback(coords);
            } else {
                console.error("Geocoding failed or returned no results for:", address);
            }
        })
        .catch(error => {
            console.error("Error during geocoding for " + address + ":", error);
        });
}

function fetchCurrentWeather(latitude, longitude) {
    console.log(`Fetching current weather for lat: ${latitude}, lon: ${longitude}`);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        .then(response => response.json())
        .then(data => {
            console.log('Current weather data:', data);
            document.getElementById('currentWeatherDetails').innerHTML = 
            `Temperature: ${data.current_weather.temperature}°C`;
        })
        .catch(error => {
            console.error("Error fetching current weather:", error);
        });
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function displayForecastDetails(title, data) {
    const forecastElement = document.getElementById('forecastDetails');
    let content = `<h3>${title}</h3>`;

    data.forEach(item => {
        content += '<div>';
        Object.keys(item).forEach(key => {
            const value = item[key];
            content += `<strong>${key}:</strong> ${value}, `;
        });
        content = content.slice(0, -2); 
        content += '</div>';
    });

    forecastElement.innerHTML += content;
}

function fetchWeatherForecast(latitude, longitude) {
    console.log(`Fetching weather forecast for lat: ${latitude}, lon: ${longitude}`);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=weather_code,temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,rain,showers,snowfall,snow_depth,visibility,evapotranspiration,weathercode&daily=weather_code,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,&timezone=auto`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching weather forecast:', data.reason);
            return;
        }

        console.log('Weather forecast data:', data);
        const forecastElement = document.getElementById('forecastDetails');
        forecastElement.innerHTML = '';

        if (data.hourly && data.hourly.time) {
            forecastElement.innerHTML += `<h3>Hourly Forecast for Today</h3>`;
            data.hourly.time.slice(0, 24).forEach((time, index) => {
                const weatherCode = data.hourly.weathercode[index];
                const temperatureC = data.hourly.temperature_2m[index];
                const temperatureF = celsiusToFahrenheit(temperatureC).toFixed(1);
                const humidity = data.hourly.relative_humidity_2m[index];
                const dewPoint = data.hourly.dew_point_2m[index];
                const apparent_temperature = data.hourly.apparent_temperature[index];
                const precipitation_probability = data.hourly.precipitation_probability[index];
                const rain = data.hourly.rain[index];
                const showers = data.hourly.showers[index];
                const snowfall = data.hourly.snowfall[index];
                const snow_depth = data.hourly.snow_depth[index];
                const visibility = data.hourly.visibility[index];
                const evapotranspiration = data.hourly.evapotranspiration[index];
                forecastElement.innerHTML += `<div><strong>${time}</strong> - Weather: ${weatherCode}, Temp: ${temperatureC}°C / ${temperatureF}°F, Humidity: ${humidity}%, Dew Point: ${dewPoint}°C, Apparent Temparature: ${apparent_temperature}°C,Precipitation Probability: ${precipitation_probability}%, Rain: ${rain}mm, Showers: ${showers}mm, Snowfall: ${snowfall}cm, Snow Depth: ${snow_depth}cm, Visibility: ${visibility}km, Evapotranspration: ${evapotranspiration}mm/day</div>`;
            });
        }

        /*if (data.daily && data.daily.time) {
            forecastElement.innerHTML += `<h3>Daily Forecast Summary</h3>`;
            data.daily.time.forEach((date, index) => {
                const maxTempC = data.daily.temperature_2m_max[index];
                const maxTempF = celsiusToFahrenheit(maxTempC).toFixed(1);
                const minTempC = data.daily.temperature_2m_min[index];
                const minTempF = celsiusToFahrenheit(minTempC).toFixed(1);
                const sunrise = data.daily.sunrise[index];
                const sunset = data.daily.sunset[index];
                const precipitationSum = data.daily.precipitation_sum[index];
                const rainSum = data.daily.rain_sum[index];
                forecastElement.innerHTML += `<div><strong>Date: ${date}</strong> - Max Temp: ${maxTempC}°C / ${maxTempF}°F, Min Temp: ${minTempC}°C / ${minTempF}°F, Sunrise: ${sunrise}, Sunset: ${sunset}, Precipitation Sum: ${precipitationSum}mm, Rain Sum: ${rainSum}mm</div>`;
            });
        }*/
    })
    .catch(error => {
        console.error("Error fetching weather forecast:", error);
    });
}

function updateBackgroundBasedOnCurrentHourWeather(data) {
    const now = new Date();
    const currentHour = now.getHours(); 

   
    let currentHourWeatherCode = 'default'; 
    data.hourly.time.forEach((time, index) => {
        const hour = new Date(time).getHours();
        if(hour === currentHour) {
            currentHourWeatherCode = data.hourly.weathercode[index];
        }
    });

    const backgroundMap = {
        '0': 'clear_sky.png',
        '1': 'mainly_clear.png', '2': 'partly_cloudy.png', '3': 'overcast.png',
        '45': 'fog.png', '48': 'rime_fog.png',
        '51': 'light_drizzle.png', '53': 'moderate_drizzle.png', '55': 'dense_drizzle.png',
        '56': 'light_freezing_drizzle.png', '57': 'dense_freezing_drizzle.png',
        '61': 'light_drizzle.png', '63': 'moderate_drizzle.png', '65': 'dense_drizzle.png',
        '66': 'light_freezing_drizzle.png', '67': 'dense_freezing_drizzle.png',
        '71': 'light_snow.png', '73': 'moderate_snow.png', '75': 'heavy_snow.png',
        '77': 'snow_grains.png',
        '80': 'light_drizzle.png', '81': 'moderate_drizzle.png', '82': 'dense_drizzle.png',
        '85': 'snow_showers.png', '86': 'snow_showers.png',
        '95': 'thunderstorm.png', '96': 'thunderstorm.png', '99': 'thunderstorm.png'
    };

    const defaultImage = 'default_weather.jpg';

    const imageUrl = backgroundMap[weatherCode.toString()] || defaultImage;

    document.body.style.backgroundImage = `url('path/to/your/images/${imageUrl}')`;
    document.body.style.backgroundSize = 'cover'; 
    document.body.style.backgroundPosition = 'center'; 
}


function displayCurrentTime(timeZoneData) {
    const updateTime = () => {
        const userTimeZoneOffset = timeZoneData.timezone_offset; 
        const nowUTC = new Date();
        const userOffsetMs = userTimeZoneOffset * 3600 * 1000;

        const localTime = new Date(nowUTC.getTime() + userOffsetMs);

        const timeString = localTime.toISOString().substr(11, 8); 

        document.getElementById('currentTime').textContent = `Current Time: ${timeString}`;
    };

    updateTime();
    setInterval(updateTime, 1000); 
}


