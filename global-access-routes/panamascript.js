document.addEventListener('DOMContentLoaded', function () {

  const ports = [
    {
      name: "Taboguilla Port",
      short: "Taboguilla",
      lat: 8.808837462,
      lng: -79.55760682,
      ocean: "Pacific",
      elev: "0 m (sea level)",
      color: "#36b295",
      desc: "The largest free trade zone in the Western Hemisphere and the Atlantic gateway to the canal.",
    },
    {
      name: "Balboa Port",
      short: "Balboa",
      lat: 8.95532195,
      lng: -79.56547193,
      ocean: "Pacific",
      elev: "0 m (sea level)",
      color: "#c9a84c",
      desc: "The Pacific terminus of the canal and the country's principal commercial port.",
    },
    {
      name: "Colón Free Trade Zone Port",
      short: "Colón",
      lat: 9.373324629,
      lng: -79.87879174,
      ocean: "Atlantic",
      elev: "0 m (sea level)",
      color: "#b85c38",
      desc: "The largest free trade zone in the Western Hemisphere and the Atlantic gateway to the canal.",
    },
    {
      name: "Manzanillo Port",
      short: "Manzanillo",
      lat: 9.367894427,
      lng: -79.88215481,
      ocean: "Atlantic",
      elev: "~26 m",
      color: "#2980b9",
      desc: "A set of two-step locks raising or lowering vessels 16.5 m between the Pacific and Miraflores Lake.",
    },
    {
      name: "Cristóbal Port",
      short: "Cristóbal",
      lat: 9.345538334,
      lng: -79.90654356,
      ocean: "Atlantic",
      elev: "~26 m",
      color: "#a40e7e",
      desc: "A set of two-step locks raising or lowering vessels 16.5 m between the Pacific and Miraflores Lake.",
    }
  ];

  // Panama Canal high-precision route waypoints (Atlantic → Pacific)
  // Format: [Latitude, Longitude]
  const canalRoute = [
    [9.3871, -79.9523], // 1. Atlantic Entrance (Breakwater at Limon Bay)
    [9.3335, -79.9274], // 2. Limon Bay main channel
    [9.2750, -79.9213], // 3. Approach to Gatun Locks
    [9.2630, -79.9205], // 4. Exiting Gatun Locks into Gatun Lake
    [9.2311, -79.9142], // 5. Gatun Lake (North channel)
    [9.1915, -79.8789], // 6. Gatun Lake (Turn near Tiger Island)

    [9.1250, -79.8200], // 7. Gatun Lake (Turn near Barro Colorado Island)
    [9.1150, -79.7900], // 8. Gatun Lake (Central channel)
    [9.1121, -79.7002], // 9. Approaching Gamboa (Chagres River meets the canal)
    [9.0965, -79.6840], // 10. Entering Culebra (Gaillard) Cut

    [9.0545, -79.6550], // 11. Culebra Cut (Gold Hill / Contractor's Hill)
    [9.0270, -79.6290], // 12. Approach to Pedro Miguel Locks
    [9.0165, -79.6123], // 13. Pedro Miguel Locks
    [9.0030, -79.6005], // 14. Miraflores Lake
    [8.9965, -79.5915], // 15. Miraflores Locks
    [8.9660, -79.5750], // 16. Balboa Port approach
    [8.9442, -79.5651], // 17. Passing under Bridge of the Americas
    [8.9055, -79.5350], // 18. Pacific Entrance (Amador Causeway / Pacific Ocean)
  ];

  // Init map
  const map = L.map('map', {
    center: [9.10, -79.73],
    zoom: 10,
    zoomControl: true,
  });

  // CartoDB Voyager tiles (open-source, no API key needed)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 15,
  }).addTo(map);

  // Canal route polyline
  L.polyline(canalRoute, {
    color: '#e74c3c',
    weight: 3,
    opacity: .75,
    dashArray: '8 5',
  }).addTo(map);

  // Custom SVG pin for ports
  function makeIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}" opacity=".95"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity=".9"/>
    </svg>`;
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [16, 32],
      iconAnchor: [0, 28],
      popupAnchor: [0, -28],
    });
  }

  const markers = [];

  ports.forEach(function (port, i) {
    const marker = L.marker([port.lat, port.lng], { icon: makeIcon(port.color) }).addTo(map);

    marker.bindPopup(
      `<div class="popup-inner">
        <p class="popup-tag">Port ${String(i + 1).padStart(2, '0')}</p>
        <p class="popup-name">${port.name}</p>
        <div class="popup-coord">
          <span>Lat: <strong>${port.lat}° N</strong></span>
          <span>Lng: <strong>${Math.abs(port.lng)}° W</strong></span>
        </div>
      </div>
      <div class="popup-footer">${port.desc}</div>`,
      { maxWidth: 260 }
    );

    markers.push(marker);

    // ── Sidebar port item ──
    const item = document.createElement('div');
    item.className = 'port-item';
    item.innerHTML = `
      <span class="port-dot"></span>
      <div class="port-info">
        <div class="port-name">${port.short}</div>
        <div class="port-coords">${port.lat}° N · ${Math.abs(port.lng)}° W</div>
      </div>`;
    item.addEventListener('click', function () { focusPort(i); });
    document.getElementById('port-list').appendChild(item);

    // ── Table row ──
    const badgeHtml = port.ocean === 'Atlantic'
      ? '<span class="badge badge-atlantic">Atlantic</span>'
      : port.ocean === 'Pacific'
        ? '<span class="badge badge-pacific">Pacific</span>'
        : '<span class="badge badge-mid">Midpoint</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="mono">${String(i + 1).padStart(2, '0')}</td>
      <td>${port.name}</td>
      <td>${badgeHtml}</td>
      <td class="mono">${port.lat}° N</td>
      <td class="mono">${Math.abs(port.lng)}° W</td>
      <td class="mono">${port.elev}</td>`;
    row.addEventListener('click', function () { focusPort(i); });
    document.getElementById('table-body').appendChild(row);
  });

  let activeIdx = null;

  function focusPort(i) {
    document.querySelectorAll('.port-item').forEach(function (el) { el.classList.remove('active'); });
    document.querySelectorAll('#table-body tr').forEach(function (el) { el.classList.remove('active'); });

    document.querySelectorAll('.port-item')[i].classList.add('active');
    document.querySelectorAll('#table-body tr')[i].classList.add('active');

    map.flyTo([ports[i].lat, ports[i].lng], 13, { duration: 1.2 });
    setTimeout(function () { markers[i].openPopup(); }, 1300);
    activeIdx = i;
  }

});
