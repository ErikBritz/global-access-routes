const CESIUM_ION_TOKEN =
	typeof window !== "undefined" && window.CESIUM_ION_TOKEN
		? window.CESIUM_ION_TOKEN
		: "PASTE_CESIUM_ION_TOKEN";
const BING_MAPS_KEY =
	typeof window !== "undefined" && window.BING_MAPS_KEY
		? window.BING_MAPS_KEY
		: "PASTE_BING_MAPS_KEY";

const straits = [
	{ id: "hurmuz", name: "Hurmuz", coords: [56.3, 26.6] },
	{ id: "bosphorus", name: "Bosphorus", coords: [29.0, 41.1] },
	{ id: "bering", name: "Bering", coords: [-168.9, 65.8] },
	{ id: "suez", name: "Suez", coords: [32.55, 30.4] },
	{ id: "panama", name: "Panama", coords: [-79.6, 9.1] },
	{ id: "malacca", name: "Malacca", coords: [102.5, 2.8] }
];

if (CESIUM_ION_TOKEN !== "PASTE_CESIUM_ION_TOKEN") {
	Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
}

async function initGlobe() {
	const imageryProvider = new Cesium.BingMapsImageryProvider({
		key: BING_MAPS_KEY,
		mapStyle: Cesium.BingMapsStyle.CANVAS_DARK
	});

	const viewer = new Cesium.Viewer("cesiumContainer", {
		animation: false,
		timeline: false,
		baseLayerPicker: false,
		geocoder: false,
		homeButton: false,
		navigationHelpButton: false,
		infoBox: false,
		fullscreenButton: false,
		selectionIndicator: false,
		orderIndependentTranslucency: false,
		useBrowserRecommendedResolution: false,
		imageryProvider
	});

	const layer = viewer.imageryLayers.addImageryProvider(
		await Cesium.IonImageryProvider.fromAssetId(3812)
	);

	viewer.resolutionScale = window.devicePixelRatio;

	viewer.scene.globe.enableLighting = false;
	viewer.scene.backgroundColor = Cesium.Color.BLACK;
	viewer.scene.globe.baseColor = Cesium.Color.BLACK;

	const entityById = {};
	const listEl = document.getElementById("strait-list");
	const dpr = window.devicePixelRatio || 1;

	straits.forEach((strait) => {
		const entity = viewer.entities.add({
			id: strait.id,
			position: Cesium.Cartesian3.fromDegrees(strait.coords[0], strait.coords[1], 20000),
			point: {
				pixelSize: 8,
				color: Cesium.Color.fromCssColorString("#8fd3ff"),
				outlineColor: Cesium.Color.WHITE,
				outlineWidth: 1,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
			},
			label: {
				text: strait.name,
				font: `600 ${Math.round(16 * dpr)}px 'IBM Plex Sans', sans-serif`,
				fillColor: Cesium.Color.WHITE,
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				outlineWidth: 3 * dpr,
				outlineColor: Cesium.Color.BLACK,
				scale: 1 / dpr,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				pixelOffset: new Cesium.Cartesian2(0, -12),
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		entityById[strait.id] = entity;
	});

	function flyToStrait(straitId) {
		const strait = straits.find((item) => item.id === straitId);
		if (!strait) {
			return;
		}
		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(strait.coords[0], strait.coords[1], 2200000),
			duration: 1.8
		});
		viewer.selectedEntity = entityById[straitId];
	}

	function flyToGlobal() {
		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
			duration: 2.0
		});
		viewer.selectedEntity = undefined;
	}

	if (listEl) {
		const globalLink = document.createElement("a");
		globalLink.href = "global.html";
		globalLink.className = "strait-link is-active";
		globalLink.textContent = "Global";
		globalLink.addEventListener("click", (event) => {
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}
			event.preventDefault();
			listEl.querySelectorAll(".strait-link").forEach((el) => {
				el.classList.remove("is-active");
			});
			globalLink.classList.add("is-active");
			flyToGlobal();
		});
		listEl.appendChild(globalLink);

		straits.forEach((strait) => {
			const link = document.createElement("a");
			link.href = `${strait.id}.html`;
			link.className = "strait-link";
			link.textContent = strait.name;
			link.addEventListener("click", (event) => {
				if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
					return;
				}
				event.preventDefault();
				listEl.querySelectorAll(".strait-link").forEach((el) => {
					el.classList.remove("is-active");
				});
				link.classList.add("is-active");
				flyToStrait(strait.id);
			});
			listEl.appendChild(link);
		});
	}

	viewer.flyTo(viewer.entities, {
		duration: 2.2
	});
}

initGlobe();
