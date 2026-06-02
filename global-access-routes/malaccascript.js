document.addEventListener('DOMContentLoaded', function () {

  const ports = [
    {
      name: "Port Klang",
      short: "Port Klang",
      lat: 2.972594826,
      lng: 101.3403063,
      ocean: "Pacific",
      color: "#36b295",
      desc: "Malaysia's primary commercial gateway. Top industries: Mineral and Vegetable Products.",
    },
    {
      name: "Port Dickson",
      short: "Port Dickson",
      lat: 2.549916819,
      lng: 101.7895789,
      ocean: "Pacific",
      color: "#c9a84c",
      desc: "Key Malaysian maritime hub focusing heavily on tanker traffic and mineral products.",
    },
    {
      name: "Penang",
      short: "Penang",
      lat: 5.379749741,
      lng: 100.3899815,
      ocean: "Pacific",
      color: "#b85c38",
      desc: "Major northern port handling high volumes of machinery and electrical equipment.",
    },
    {
      name: "Pelabuhan Sungai Udang",
      short: "Sg. Udang",
      lat: 2.263627014,
      lng: 102.1357975,
      ocean: "Pacific",
      color: "#2980b9",
      desc: "Specialized industrial port handling mineral and chemical products exclusively via tankers.",
    },
    {
      name: "Lumut",
      short: "Lumut",
      lat: 4.227365727,
      lng: 100.6433762,
      ocean: "Pacific",
      color: "#a40e7e",
      desc: "Handles substantial dry bulk commodities along the west coast of Peninsular Malaysia.",
    },
    {
      name: "Uleelheue",
      short: "Uleelheue",
      lat: 5.59637662,
      lng: 95.52598222,
      ocean: "Pacific",
      color: "#16a085",
      desc: "Located at the northwestern tip of Sumatra, Indonesia, bordering the gateway to the Strait.",
    },
    {
      name: "Sungai Pakning",
      short: "Sg. Pakning",
      lat: 1.348263696,
      lng: 102.1578799,
      ocean: "Pacific",
      color: "#27ae60",
      desc: "Indonesian anchorage port managing regional oil and gas maritime transit traffic.",
    },
    {
      name: "Kuala Tanjung",
      short: "Kuala Tanjung",
      lat: 3.372062986,
      lng: 99.45586143,
      ocean: "Pacific",
      color: "#2c3e50",
      desc: "Developing industrial deep-sea port on the Sumatran coast of the Malacca Strait.",
    },
    {
      name: "Dumai",
      short: "Dumai",
      lat: 1.717388504,
      lng: 101.4188235,
      ocean: "Pacific",
      color: "#d35400",
      desc: "Major Indonesian export node for mineral products, chemicals, and palm oil assets.",
    },
    {
      name: "Blanglancang",
      short: "Blanglancang",
      lat: 5.230939806,
      lng: 97.06571881,
      ocean: "Pacific",
      color: "#8e44ad",
      desc: "Sumatran port mainly serving energy sectors, liquid bulk tankers, and mineral operations.",
    },
    {
      name: "Belawan",
      short: "Belawan",
      lat: 3.78854271,
      lng: 98.70736598,
      ocean: "Pacific",
      color: "#f39c12",
      desc: "Indonesia's busiest port outside of Java, acting as a crucial link for agricultural exports.",
    },
    {
      name: "Serangoon Harbor",
      short: "Serangoon",
      lat: 1.358261773,
      lng: 104.0345309,
      ocean: "Pacific",
      color: "#7f8c8d",
      desc: "Singaporean harbor handling significant localized vessel traffic, dominated by mineral and chemical transport.",
    },
    {
      name: "Singapore",
      short: "Singapore",
      lat: 1.271989257,
      lng: 103.7074816,
      ocean: "Pacific",
      color: "#e74c3c",
      desc: "Global mega-hub accounting for over 95% of Singapore's maritime trade. Massive container and tanker traffic.",
    }
  ];

  // Init map focused on the wider region
  const map = L.map('map', {
    center: [3.5, 101.5],
    zoom: 6,
    zoomControl: true,
  });

  // CartoDB Voyager tiles (open-source)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 15,
  }).addTo(map);

  // Custom SVG pin for ports
  function makeIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="${color}" opacity=".95"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity=".9"/>
    </svg>`;
    return L.divIcon({
      html: svg,
      className: 'port-marker-icon',
      iconSize: [16, 32],
      iconAnchor: [8, 32], 
      popupAnchor: [0, -32],
    });
  }

  const markers = [];

  // Generate Port Markers, Sidebar list, and Table items
  ports.forEach(function (port, i) {
    const marker = L.marker([port.lat, port.lng], { icon: makeIcon(port.color) }).addTo(map);

    marker.bindPopup(
      `<div class="popup-inner">
        <p class="popup-tag">Port ${String(i + 1).padStart(2, '0')}</p>
        <p class="popup-name">${port.name}</p>
        <div class="popup-coord">
          <span>Lat: <strong>${port.lat.toFixed(4)}° N</strong></span>
          <span>Lng: <strong>${port.lng.toFixed(4)}° E</strong></span>
        </div>
      </div>
      <div class="popup-footer">${port.desc}</div>`,
      { maxWidth: 260 }
    );

    markers.push(marker);

    // ── Sidebar port item ──
    const item = document.createElement('div');
    item.className = 'port-item';
    item.id = `sidebar-item-${i}`;
    item.style.borderLeft = `4px solid ${port.color}`; 
    item.innerHTML = `
      <span class="port-dot" style="background-color: ${port.color}"></span>
      <div class="port-info">
        <div class="port-name">${port.short}</div>
        <div class="port-coords">${port.lat.toFixed(3)}° N · ${port.lng.toFixed(3)}° E</div>
      </div>`;
    item.addEventListener('click', function (e) { 
      e.stopPropagation(); // Avoid triggering map reset clicks
      focusPort(i); 
    });
    document.getElementById('port-list').appendChild(item);

    // ── Table row ──
    const badgeHtml = `<span class="badge" style="background-color: ${port.color}; color: #fff;">${port.ocean}</span>`;

    const row = document.createElement('tr');
    row.id = `table-row-${i}`;
    row.innerHTML = `
      <td class="mono">${String(i + 1).padStart(2, '0')}</td>
      <td><strong>${port.name}</strong></td>
      <td>${badgeHtml}</td>
      <td class="mono">${port.lat.toFixed(4)}° N</td>
      <td class="mono">${port.lng.toFixed(4)}° E</td>`;
    row.addEventListener('click', function (e) { 
      e.stopPropagation();
      focusPort(i); 
    });
    document.getElementById('table-body').appendChild(row);
  });

  // ── Highlighting & Geospatial Filtering Engine ──
  let activeStraitLayer = null;

  const defaultStraitStyle = {
    color: "#2c3e50",
    weight: 2,
    opacity: 0.4,
    fillColor: "#34495e",
    fillOpacity: 0.1,
    dashArray: '4, 4'
  };

  const highlightStraitStyle = {
    color: "#2980b9",
    weight: 3,
    opacity: 0.9,
    fillColor: "#3498db",
    fillOpacity: 0.25,
    dashArray: ''
  };

  function filterPortsByBoundary(geoJsonFeature) {
    ports.forEach((port, idx) => {
      // Turf checks coordinates in [Longitude, Latitude] structure
      const pt = turf.point([port.lng, port.lat]);
      const isInside = turf.booleanPointInPolygon(pt, geoJsonFeature);

      const sidebarEl = document.getElementById(`sidebar-item-${idx}`);
      const rowEl = document.getElementById(`table-row-${idx}`);
      const markerEl = markers[idx].getElement();

      if (isInside) {
        // Highlight Matches
        if (sidebarEl) sidebarEl.style.opacity = "1";
        if (rowEl) rowEl.style.opacity = "1";
        if (markerEl) markerEl.style.opacity = "1";
      } else {
        // Dim Non-Matches
        if (sidebarEl) sidebarEl.style.opacity = "0.25";
        if (rowEl) rowEl.style.opacity = "0.25";
        if (markerEl) markerEl.style.opacity = "0.15";
      }
    });
  }

  function resetFilters() {
    activeStraitLayer = null;
    straitLayers.forEach(layer => layer.setStyle(defaultStraitStyle));
    
    // Restore all elements back to full visibility
    ports.forEach((_, idx) => {
      const sidebarEl = document.getElementById(`sidebar-item-${idx}`);
      const rowEl = document.getElementById(`table-row-${idx}`);
      const markerEl = markers[idx].getElement();

      if (sidebarEl) sidebarEl.style.opacity = "1";
      if (rowEl) rowEl.style.opacity = "1";
      if (markerEl) markerEl.style.opacity = "1";
    });
  }

  // Handle clicking outside a shape to clear selection bounds
  map.on('click', function () {
    resetFilters();
  });

  const straitLayers = [];

  function loadStraitBoundary(url, name) {
    fetch(url)
      .then(res => res.json())
      .then(geoJsonData => {
        const layer = L.geoJSON(geoJsonData, {
          style: defaultStraitStyle
        }).addTo(map);

        straitLayers.push(layer);

        // Bind custom click tracking onto the spatial feature layer
        layer.on('click', function (e) {
          L.DomEvent.stopPropagation(e); // Stop event passing straight down to base map

          if (activeStraitLayer === layer) {
            resetFilters();
          } else {
            // Drop styling from any previously checked boundary layout
            straitLayers.forEach(l => l.setStyle(defaultStraitStyle));
            
            // Activate target boundary geometry properties
            layer.setStyle(highlightStraitStyle);
            activeStraitLayer = layer;

            // Extract the standard feature details for Turf analysis
            const feature = geoJsonData.features ? geoJsonData.features[0] : geoJsonData;
            filterPortsByBoundary(feature);
          }
        });

        // Optional: Tooltip hover to see Strait name
        layer.bindTooltip(name, { sticky: true });
      })
      .catch(err => console.error(`Error processing boundary file: ${url}`, err));
  }

  // ── Import Boundary Files ──
  loadStraitBoundary('malaccastrait_borders.geojson', 'Malacca Strait Boundary');
  loadStraitBoundary('singaporestrait_borders.geojson', 'Singapore Strait Boundary');


  let activeIdx = null;

  function focusPort(i) {
    document.querySelectorAll('.port-item').forEach(function (el) { el.classList.remove('active'); });
    document.querySelectorAll('#table-body tr').forEach(function (el) { el.classList.remove('active'); });

    const sidebarEl = document.getElementById(`sidebar-item-${i}`);
    const rowEl = document.getElementById(`table-row-${i}`);
    
    if (sidebarEl) sidebarEl.classList.add('active');
    if (rowEl) rowEl.classList.add('active');

    map.flyTo([ports[i].lat, ports[i].lng], 12, { duration: 1.2 });
    setTimeout(function () { markers[i].openPopup(); }, 1300);
    activeIdx = i;
  }

});