let map, marker, watchId;
let linePath, lineMarkers = [];
let activeLine = null;
let currentStopIndex = 0;
let wasNearStop = false;

// Wstawienie ikony samochodzika
const carIcon = {
  url: "https://i.imgur.com/Fy0rspp.png",  // Podmień ten URL na rzeczywisty link do ikony samochodu
  scaledSize: new google.maps.Size(40, 40), // Rozmiar ikony (dopasuj według potrzeb)
};

const fakeLines = {
    "101": {
      directions: {
        "PKP Józefów": [
          { name: "Metalizacja", lat: 52.12205, lng: 21.20930 },
          { name: "Godebskiego", lat: 52.12352, lng: 21.21154 },
          { name: "Łąkowa", lat: 52.12612, lng: 21.21558 },
          { name: "Prusa", lat: 52.12809, lng: 21.21871 },
          { name: "Sienkiewicza", lat: 52.13077, lng: 21.22406 },
          { name: "3-go Maja", lat: 52.13284, lng: 21.22779 },
          { name: "Świderska", lat: 52.13499, lng: 21.23167 },
          { name: "Urząd Miasta", lat: 52.13635, lng: 21.23438 },
          { name: "PKP Józefów", lat: 52.13620, lng: 21.23594 }
        ],
        "Metalizacja": [
          { name: "PKP Józefów", lat: 52.13620, lng: 21.23594 },
          { name: "Sosnowa", lat: 52.13514, lng: 21.23411 },
          { name: "Świderska", lat: 52.13499, lng: 21.23167 },
          { name: "3-go Maja", lat: 52.13284, lng: 21.22779 },
          { name: "Sienkiewicza", lat: 52.13077, lng: 21.22406 },
          { name: "Prusa", lat: 52.12809, lng: 21.21871 },
          { name: "Łąkowa", lat: 52.12612, lng: 21.21558 },
          { name: "Godebskiego", lat: 52.12352, lng: 21.21154 },
          { name: "Metalizacja", lat: 52.12205, lng: 21.20930 }
        ]
      }
    }
};

// Funkcja inicjalizująca mapę
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 52.2297, lng: 21.0122 },
    rotateControl: true, // Włączenie obrotu mapy
  });

  marker = new google.maps.Marker({
    map,
    title: "Twoja lokalizacja",
    icon: carIcon,  // Ustawienie ikony samochodzik
  });

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        marker.setPosition(pos);
        map.setCenter(pos);
      },
      () => alert("Błąd przy pobieraniu lokalizacji.")
    );
  }

  // Aktualizacja przystanku co 2 sekundy
  setInterval(() => {
    if (!activeLine || !marker.getPosition()) return;
  
    const userPos = marker.getPosition();
  
    if (currentStopIndex >= activeLine.stops.length) {
      document.getElementById("ibis-next").innerText = "Koniec trasy.";
      return;
    }
  
    const stop = activeLine.stops[currentStopIndex];
    const stopPos = new google.maps.LatLng(stop.lat, stop.lng);
    const dist = google.maps.geometry.spherical.computeDistanceBetween(userPos, stopPos);
  
    if (dist <= 5) {
      wasNearStop = true;
    } else if (wasNearStop && dist > 10) {
      wasNearStop = false;
      currentStopIndex++;
      if (currentStopIndex >= activeLine.stops.length) {
        document.getElementById("ibis-next").innerText = "Koniec trasy.";
        return;
      }
    }
  
    if (currentStopIndex < activeLine.stops.length) {
      const nextStop = activeLine.stops[currentStopIndex];
      const nextStopPos = new google.maps.LatLng(nextStop.lat, nextStop.lng);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(userPos, nextStopPos);
      document.getElementById("ibis-next").innerText =
        `Następny przystanek: ${nextStop.name} (${Math.round(distance)} m)`;
    }
  }, 2000);
}

// Funkcja ładowania trasy
function loadFakeLine() {
    const line = document.getElementById("lineNumber").value;
    const direction = document.getElementById("lineDirection").value;
  
    const data = fakeLines[line];
    if (!data || !data.directions[direction]) {
      alert("Nieprawidłowy numer linii lub kierunek.");
      return;
    }
  
    const stops = data.directions[direction];
    activeLine = { stops };
    currentStopIndex = 0;
    wasNearStop = false;

     // Tylko przystanki
    if (linePath) linePath.setMap(null);
    lineMarkers.forEach(m => m.setMap(null));
    lineMarkers = [];
  
    const coords = stops.map(s => ({ lat: s.lat, lng: s.lng }));
  
    linePath = new google.maps.Polyline({
      path: coords,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });
    linePath.setMap(map);
  
    stops.forEach(stop => {
      const marker = new google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        icon: "https://maps.google.com/mapfiles/ms/icons/bus.png",
        title: stop.name,
      });
  
      marker.addListener("click", () => {
        new google.maps.InfoWindow({
          content: `<b>${stop.name}</b>`
        }).open(map, marker);
      });
  
      lineMarkers.push(marker);
    });
  
    document.getElementById("ibis-next").innerText = "Oczekiwanie na ruch...";
}

function loadLineDirections() {
    const line = document.getElementById("lineNumber").value;
    const lineData = fakeLines[line];
  
    const directionSelect = document.getElementById("lineDirection");
    const directionContainer = document.getElementById("directionContainer");
  
    if (!lineData) {
      alert("Nie znaleziono takiej linii.");
      directionContainer.style.display = "none";
      return;
    }
  
    // Wyczyść stare opcje
    directionSelect.innerHTML = "";
  
    // Wstaw nowe kierunki
    for (const dir in lineData.directions) {
      const option = document.createElement("option");
      option.value = dir;
      option.text = dir;
      directionSelect.appendChild(option);
    }
  
    directionContainer.style.display = "block";
}
