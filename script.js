document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("logoutBtn").addEventListener("click", function () {
    // Clear form fields for login and register
    console.log("Gyl");
    
    // Optionally, redirect to a different page (like a login page)
    window.location.href = "index.html"; // Redirect to the login page, if required
});

  document.getElementById("searchBtn").addEventListener("click", function () {
      let address = document.getElementById("address");
      let region = document.getElementById("region");
      let city = document.getElementById("city");
      let unit = document.querySelector('input[name="unit"]:checked').value;

      let valid = true;

      // Validation Function
      function validateField(field) {
          // Correctly get the ID from the field's id attribute
          const wrapper = '#' + field.id + '-err'; // Assuming error div has ID based on field ID

          
          console.log(wrapper);
         
          // Get the errorDiv by selecting the correct wrapper element
          const errorDiv = document.querySelector(wrapper);
      
          // Check if the field is empty or if city is selected
          if (!field.value.trim() || (field.id === "city" && field.value === "")) {
              
                  errorDiv.style.color = "red";  // Show the error message in red
              valid=false;
              
          } else {
          
                  errorDiv.style.color = "transparent";  // Hide the error message
              
          }
          console.log('done')
      }
      

      // Apply validation checks
      validateField(address);
      validateField(region);
      validateField(city);


  if (!valid) return; // Stop execution if validation fails

  // ✅ Submit to database via POST
  const country = "Cyprus";

  const payload = {
    username: "nioann02",
    address: address.value.trim(),
    region: region.value.trim(),
    city: city.value,
    country: country,
  };

  

  // 🌍 Nominatim Search API
  const query = `${address.value}, ${region.value}, ${city.value}`;
  const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&addressdetails=1`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((locationData) => {
      if (locationData.length === 0) {
        alert("No result for that location.");
        return;
      }

      const lat = parseFloat(locationData[0].lat);
      const lon = parseFloat(locationData[0].lon);

      console.log(`📍 Latitude: ${lat}, Longitude: ${lon}`);
      
      // 🌐 Send POST to your backend
      fetch("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((responseData) => {
          console.log("✅ Server POST response:", responseData);
        })
        .catch((err) => {
          console.error("❌ POST error:", err);
        });


      fetchWeatherData(lat, lon, unit);
      fetchForecastData(lat, lon, unit);
      displayWeatherMap(lat, lon);
    })
    .catch((err) => {
      console.error("❌ Location fetch error:", err);
      alert("An error occurred while fetching location data.");
    });
});

// You can also implement the CLEAR button logic here
});

document.getElementById("clearBtn").addEventListener("click", function () {
hideResults(); // Calls the function to hide all weather sections
console.log("Cleared input and hid weather results.");
});
let cityName;
// Function to Fetch Current Weather Data
function fetchWeatherData(lat, lon, unit) {
const API_KEY = "707f2174aac1f044357d58a630890e4a";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    console.log("Weather API Response:", data);

    if (data.cod !== 200) {
      alert("Error fetching weather data: " + data.message);
      return;
    }

    // ✅ Ensure data is available before accessing properties
    let description = data.weather?.[0]?.description ?? "N.A.";
    let icon = data.weather?.[0]?.icon ?? "";
    let iconUrl = icon
      ? `https://openweathermap.org/img/wn/${icon}@2x.png`
      : "";
    let temperature = data.main?.temp ?? "N.A.";
    let tempMin = data.main?.temp_min ?? "N.A.";
    let tempMax = data.main?.temp_max ?? "N.A.";
    let humidity = data.main?.humidity ?? "N.A.";
    let pressure = data.main?.pressure ?? "N.A.";
    let windSpeed = data.wind?.speed ?? "N.A.";
    let cloudCover = data.clouds?.all ?? "N.A.";
     cityName = data.name ?? "N.A"; // Dynamically get city name from the API response

    let tempUnit = unit === "imperial" ? "°F" : "°C";
    let speedUnit = unit === "metric" ? "meters/sec" : "miles/hour";
    let pressureUnit = unit === "metric" ? "hPa" : "Mb ";

    // Convert sunrise & sunset timestamps
    let sunrise = data.sys?.sunrise ? formatDateTime(data.sys.sunrise) : "N.A.";
    let sunset = data.sys?.sunset ? formatDateTime(data.sys.sunset) : "N.A.";
    
    
  

    // Update HTML elements
    document.getElementById("weatherIcon").src = iconUrl;
    document.getElementById(
      "weatherDescription"
    ).textContent = `${description} in ${cityName}`; // Get location from API
    document.getElementById("currentTemp").textContent = `${temperature} ${tempUnit}`;
    document.getElementById("lowTemp").textContent = `${tempMin} ${tempUnit}`;
    document.getElementById("highTemp").textContent = `${tempMax} ${tempUnit}`;
    document.getElementById("pressure").textContent = `${pressure} ${pressureUnit}`;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById(
      "windSpeed"
    ).textContent = `${windSpeed} ${speedUnit}`;
    document.getElementById("cloudCover").textContent = `${cloudCover}%`;
    document.getElementById("sunrise").textContent = sunrise;
    document.getElementById("sunset").textContent = sunset;

    // Show the results section
    showResults();
  })
  .catch((error) => {
    console.error("Error fetching weather data:", error);
    alert("An error occurred while fetching weather data.");
  });
}

// Function to Fetch 5-Day Forecast Data
let cachedForecastData = null; // Store data globally to avoid duplicate API calls
let cachedUnit = null;

async function fetchForecastData(lat, lon, unit) {
  const API_KEY = "707f2174aac1f044357d58a630890e4a";
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;

  // ✅ Build a unique cache key based on form input + unit
  const address = document.getElementById("address").value.trim();
  const region = document.getElementById("region").value.trim();
  const city = document.getElementById("city").value.trim();
  const key = `${address}|${region}|${city}|${unit}`;

  console.log("Region"+region);
  console.log("CIty"+city)
  if (cachedForecastData && cachedForecastKey === key) {
    console.log("✅ Using cached forecast data for same location + unit.");
    
    displayNext24hForecast(cachedForecastData.list, unit, cityName);
    displayForecastCharts(cachedForecastData.list, unit, region);
    return;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.cod !== "200") {
      alert("Error fetching forecast data: " + data.message);
      return;
    }

    cachedForecastData = data;
    cachedForecastKey = key;

    
    
    displayNext24hForecast(data.list, unit, cityName);
    displayForecastCharts(data.list, unit, region);

  } catch (error) {
    console.error("Error fetching forecast data:", error);
    alert("Failed to load forecast data.");
  }
}



// Function to Display Weather Map
let weatherMap = null; // Store the map globally

function displayWeatherMap(lat, lon) {
console.log("Initializing Weather Map at:", lat, lon);

let mapContainer = document.getElementById("map");
if (!mapContainer) {
  console.error("Weather map container not found!");
  return;
}

// Remove previous map instance if it exists
if (weatherMap) {
  weatherMap.setTarget(null);
  weatherMap = null;
}

// Your OpenWeatherMap App ID
const appId = "707f2174aac1f044357d58a630890e4a";

// Create OSM base layer
const baseLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

// Precipitation Layer
const precipitationLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${appId}`,
  }),
  opacity: 0.4,
});

// Temperature Layer
const temperatureLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${appId}`,
  }),
  opacity: 0.5,
});

// Create the map
weatherMap = new ol.Map({
  target: "map",
  layers: [baseLayer, precipitationLayer, temperatureLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([lon, lat]),
    zoom: 5,
  }),
});

// Delay map update size slightly to ensure it's visible
setTimeout(() => {
  weatherMap.updateSize();
}, 300);

console.log("Weather map successfully updated.");
}

// Function to Show Results Sections
// Function to Show Results Sections
// Function to Show Results Sections (Ensure Elements Exist Before Changing Style)
function showResults() {
let resultsSection = document.getElementById("resultsSection");
if (!resultsSection) {
  console.error("Error: #resultsSection not found!");
  return;
}
resultsSection.style.display = "block";

let elements = [
  "resultsSection",
  "forecast24hDetails",
  "chartContainer",
  "weatherMap",
];
elements.forEach((id) => {
  let el = document.getElementById(id);
  if (el) {
    el.style.display = "block";
  } else {
    console.warn(`Warning: #${id} not found!`);
  }
});

console.log("Results section displayed successfully.");
}

// Function to Hide Results Sections
function hideResults() {
document
  .querySelectorAll(
    "#weatherResults, #next24hForecast, #forecastCharts, #weatherMap"
  )
  .forEach((el) => {
    if (el) el.style.display = "none"; // Ensures the element exists before modifying style
  });

let resultsSection = document.getElementById("resultsSection");
if (resultsSection) resultsSection.style.display = "none";

console.log("Weather results hidden.");
}

// Function to Display Weather Data
function formatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}


function displayNext24hForecast(forecastList, unit, cityName) {
  const forecastDiv = document.getElementById("forecast24hDetails");
  const modalsDiv = document.getElementById("modalsContainer");
  
  if (!forecastDiv || !modalsDiv) {
    console.error("Missing forecast or modals container!");
    return;
  }

  const tempUnit = unit === "metric" ? "°C" : "°F";
  const speedUnit = unit === "metric" ? "meters/sec" : "miles/hour";
  const pressureUnit = unit === "metric" ? "hPa" : "Mb";

  let tableHTML = `
    <table class="table table-sm align-middle text-center table-striped border-bottom w-100">
      <thead class="table-light">
        <tr>
          <th>Time</th>
          <th>Summary</th>
          <th>Temp</th>
          <th>Cloud Cover</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
  `;

  let modalsHTML = "";

  for (let i = 0; i < 8; i++) {
    const entry = forecastList[i];
    const date = new Date(entry.dt * 1000);

    const time = date.toISOString().slice(0, 16).replace("T", " ");
    const modalTime = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(",", "");

    const icon = entry.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const temp = entry.main.temp.toFixed(2);
    const clouds = `${entry.clouds.all}%`;
    const modalId = `forecastModal${i}`;

    tableHTML += `
      <tr>
        <td>${time}</td>
        <td><img src="${iconUrl}" alt="Weather Icon" width="40"></td>
        <td>${temp} ${tempUnit}</td>
        <td>${clouds}</td>
        <td class="text-center align-middle my-auto	">
          <button style="margin: 0 auto; display: block;" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">View</button>
        </td>
      </tr>
    `;

    modalsHTML += `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal-md">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}Label">Weather in ${cityName} on ${modalTime}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center px-2 px-sm-4">
              <div class="d-flex align-items-center justify-content-center mb-3 flex-wrap text-center text-md-start weather-summary">
  <div class="me-0">
    <img src="${iconUrl}" alt="Icon" width="60" class="img-fluid ms-5">
  </div>
  <div>
    <p class="mb-0 ms-7">
      <strong>${entry.weather[0].main}</strong>
      <small class="text-muted">(${entry.weather[0].description})</small>
    </p>
  </div>
</div>

              <div class="row text-center">
                <div class="col-12 col-sm-4 mb-3 mb-sm-0">
                  <p class="mb-1"><strong>Humidity</strong></p>
                  <p>${entry.main.humidity}%</p>
                </div>
                <div class="col-12 col-sm-4 mb-3 mb-sm-0">
                  <p class="mb-1"><strong>Pressure</strong></p>
                  <p>${entry.main.pressure} ${pressureUnit}</p>
                </div>
                <div class="col-12 col-sm-4">
                  <p class="mb-1"><strong>Wind Speed</strong></p>
                  <p>${entry.wind.speed} ${speedUnit}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
<button type="button" class="btn btn-danger btn-sm ms-auto" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  tableHTML += `</tbody></table>`;

  // ✅ Inject table into forecast section
  forecastDiv.innerHTML = tableHTML;

  // ✅ Inject modals OUTSIDE the tab pane
  modalsDiv.innerHTML = modalsHTML;

  showResults();
}




function displayForecastCharts(forecastList, unit, regionName) {
  document.getElementById("forecastCity").textContent = `${regionName}, ${
    document.getElementById("city").value
  }`;

  let tempUnit = unit === "metric" ? "°C" : "°F";
  let pressureUnit = unit === "metric" ? "hPa" : "Mb";

  let dates = [],
    temps = [],
    humidities = [],
    pressures = [];

  for (let i = 0; i < forecastList.length; i++) {
    let entry = forecastList[i];
    let date = new Date(entry.dt_txt);

    dates.push(date);
    temps.push(entry.main.temp);
    humidities.push(entry.main.humidity);
    pressures.push(entry.main.pressure);
  }

  // Create simplified tickvals: every 2 days from the start
  const tickvals = [];
for (let i = 0; i < dates.length; i += 16) { // 8 entries per day × 2 days = 16
  tickvals.push(dates[i]);
}

  
  const ticktext = tickvals.map(d =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );
  

  const layout = (title) => ({
    title: title,
    autosize: true,
    height: getResponsiveHeight(),
    margin: { t: 30, b: 60, l: 10, r: 10 },
    xaxis: {
      tickangle: 0,
      tickmode: "array",
      tickvals: tickvals,
      ticktext: ticktext,
      automargin: true,
    },
    
    
      automargin: true,
    yaxis: {
      automargin: true,
    },
    annotations: [
      {
        text: dates[0].getFullYear().toString(),
        xref: "paper",
        yref: "paper",
        x: 0.055,           // Around where the first date tick is
        y: window.innerWidth < 576 ? -0.25 : -0.1,
        xanchor: "center",
        showarrow: false,
        font: {
          size: 12,
         
        }
      }
    ],
    
    
    
    
    
    
  });

  // Temperature Chart
  Plotly.newPlot(
    "tempChart",
    [
      {
        x: dates,
        y: temps,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "#2980b9", size: 5 },
        line: { width: 2 },
      },
    ],
    layout(`Temperature Forecast (${tempUnit})`),
    { responsive: true }
  );

  // Humidity Chart
  Plotly.newPlot(
    "humidityChart",
    [
      {
        x: dates,
        y: humidities,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "#2980b9", size: 5 },
        line: { width: 2 },
      },
    ],
    layout("Humidity Forecast (%)"),
    { responsive: true }
  );

  // Pressure Chart
  Plotly.newPlot(
    "pressureChart",
    [
      {
        x: dates,
        y: pressures,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "#2980b9", size: 5 },
        line: { width: 2 },
      },
    ],
    layout(`Pressure Forecast (${pressureUnit})`),
    { responsive: true }
  );

  // Update headers and show section
  let forecastSection = document.getElementById("forecastChartsSection");
  let charts = forecastSection.getElementsByTagName("h5");
  charts[0].innerText = `Temperature (${tempUnit})`;
  charts[2].innerText = `Pressure (${pressureUnit})`;

  forecastSection.style.display = "block";

  setTimeout(() => {
    Plotly.Plots.resize("tempChart");
    Plotly.Plots.resize("humidityChart");
    Plotly.Plots.resize("pressureChart");
  }, 0);

  console.log("5-Day Forecast section displayed successfully.");
}

function getResponsiveHeight() {
const width = window.innerWidth;
if (width >= 1200) return 420; // was 500
if (width >= 992) return 350; // was 400
if (width >= 768) return 280; // was 320
return 220; // was 250
}

window.addEventListener("resize", () => {
Plotly.Plots.resize("tempChart");
Plotly.Plots.resize("humidityChart");
Plotly.Plots.resize("pressureChart");
});




function displayLogModal(data) {
  let html = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Last 5 Requests</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="logModalBody">
          <div class="table-responsive">
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Address</th>
                  <th>Region</th>
                  <th>City</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
  `;

  data.data.forEach((entry) => {
    const date = new Date(entry.timestamp * 1000);
    const formattedTime = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    html += `
      <tr>
        <td>${formattedTime}</td>
        <td>${entry.address}</td>
        <td>${entry.region}</td>
        <td>${entry.city}</td>
        <td>${entry.country}</td>
      </tr>
    `;
  });

  html += `
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer justify-content-end">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  const logModalEl = document.getElementById("logModal");
  logModalEl.innerHTML = html;

  const logModal = new bootstrap.Modal(logModalEl);
  logModal.show();
}

	


//GET REQUEST//
function fetchRecentLogs() {
fetch("api.php?username=nioann02")
  .then((res) => res.json())
  .then((data) => {
    console.log("Last 5 entries:", data);
    displayLogModal(data); // create a function to show the modal
  })
  .catch((err) => console.error(err));
}

document.getElementById("logBtn").addEventListener("click", fetchRecentLogs);