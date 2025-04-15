let map, marker, watchId, linePath, lineMarkers = [];
const fakeLineCoordinates = [
  { lat: 52.2297, lng: 21.0122 }, // przykładowe przystanki
  { lat: 52.2305, lng: 21.0150 },
  { lat: 52.2312, lng: 21.0180 },
  { lat: 52.2320, lng: 21.0200 }
];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: fakeLineCoordinates[0],
    mapId: "your_map_id" // jeśli chcesz custom mapę
  });

  marker = new google.maps.Marker({
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "blue",
      fillOpacity: 1,
      strokeWeight: 2
    }
  });

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        marker.setPosition(pos);
        map.setCenter(pos);
      },
      () => {
        alert("Nie można pobrać lokalizacji.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  }
}

function loadFakeLine() {
  const line = document.getElementById("lineNumber").value;
  const direction = document.getElementById("lineDirection").value;

  alert(`Załadowano linię ${line} w kierunku ${direction}`);

  // Wyczyść poprzednią linię
  if (linePath) linePath.setMap(null);
  lineMarkers.forEach(m => m.setMap(null));
  lineMarkers = [];

  // Narysuj linię
  linePath = new google.maps.Polyline({
    path: fakeLineCoordinates,
    geodesic: true,
    strokeColor: "#00FF00",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  });

  linePath.setMap(map);

  // Dodaj markery przystanków
  fakeLineCoordinates.forEach(coord => {
    const m = new google.maps.Marker({
      position: coord,
      map,
      icon: "https://maps.google.com/mapfiles/ms/icons/bus.png"
    });
    lineMarkers.push(m);
  });
}
