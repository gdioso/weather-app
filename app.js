const api = {
    key: "a8d47de60f6b664c116bded7a9edc050",
    baseURL: "https://api.openweathermap.org/"
};

// Declare event objects
const search = document.querySelector('.search');
const toggle = document.querySelector('.toggle');

// Load event listeners
loadEventListeners();

function loadEventListeners() {
    window.addEventListener('load', getCurrentLocation);
    search.addEventListener('keypress', setQuery);
    toggle.addEventListener('click', toggleUnits);
}

function getCurrentLocation() {
    // If location exists in browser, then use current coordinates to fetch location data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            reverseGeocode(lat, lon);
        })
    }
}

function setQuery(e) {
    if (e.key === "Enter") {
        geocode(search.value);
        search.value = '';
    } 
}

function toggleUnits(e) {
    const temp = document.querySelectorAll('.temp');
    const units = document.querySelectorAll('.units');

    for (let i = 0; i < units.length; i++) {
        units[i].textContent = units[i].textContent === '°F' ? '°C' : '°F';
    }

    for (let i = 0; i < temp.length; i++) {
        temp[i].textContent = units[0].textContent === '°F' ? convertTempF(temp[i].textContent) : convertTempC(temp[i].textContent);
    }
}

function reverseGeocode(lat, lon) {
    fetch(`${api.baseURL}geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${api.key}`)
        .then(response => response.json())
        .then(pos => {
            displayLocation(pos[0]);
            return fetchWeather(lat, lon);
        });
}

function geocode(query) {
    fetch(`${api.baseURL}geo/1.0/direct?q=${query}&appid=${api.key}`)
        .then(response => response.json())
        .then(pos => {
            displayLocation(pos[0]);
            return fetchWeather(pos[0].lat, pos[0].lon);
        });
}

function fetchWeather(lat, lon) {
    const units = document.querySelector('.units');
    const unitType = units.textContent === '°F' ? 'imperial' : 'metric';
    
    fetch(`${api.baseURL}data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api.key}&units=${unitType}`)
        .then(response => response.json())
        .then(displayWeather);
}

function displayLocation(pos) {
    const location = document.querySelector('.location');
    location.textContent = `${pos.name}, ${pos.country}`;
}

function displayWeather(forecast) {
    const date = document.querySelector('.date');
    const currentTemp = document.querySelector('.current-temp');
    const weatherIcon = document.querySelector('.weather-icon');
    const sky = document.querySelector('.sky');
    const hiLow = document.querySelector('.hi-low');
    const units = document.querySelector('.units');
    const unitType = units.textContent;

    // Set background
    document.body.style.background = setBackground(forecast.weather[0].icon);

    // Set date
    date.textContent = getDate(forecast.timezone);

    // Set current temperature
    currentTemp.innerHTML = `<span class="temp">${Math.round(forecast.main.temp)}</span><span class="units">${unitType}</span>`;
    
    // Set weather icon
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather">`;

    // Set current weather conditions
    sky.textContent = forecast.weather[0].description;

    // Set high and low temperatures
    hiLow.innerHTML = `H: <span class="temp">${Math.round(forecast.main.temp_max)}</span><span class="units">${unitType}</span> &emsp; L: <span class="temp">${Math.round(forecast.main.temp_min)}</span><span class="units">${unitType}</span>`;
}

function setBackground(str) {
    const dayBG = 'linear-gradient(to top, #00d2ff, #3a47d5)';
    const nightBG = 'linear-gradient(to top, #2d365c, #20002c)';

    return str.charAt(str.length - 1) === 'd' ? dayBG : nightBG;
}

function getDate(timezone) {
    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
    };

    // Get the time zone offset of the current location in seconds
    const localOffset = new Date().getTimezoneOffset() * 60;

    // Calculate the offset in milliseconds that needs to be applied to the current date and time
    const offsetMilliseconds = (timezone + localOffset) * 1000;

    // Create a new date object with the current date and time adjusted by the offset
    const currentDate = new Date(Date.now() + offsetMilliseconds);

    const formattedDate = currentDate.toLocaleString("en-US", options);
    return formattedDate;
}

function convertTempF (tempF) {
    const tempC = Math.round(tempF * 9 / 5 + 32);
    return tempC;
}

function convertTempC (tempC) {
    const tempF = Math.round((tempC - 32) * 5 / 9);
    return tempF;
}