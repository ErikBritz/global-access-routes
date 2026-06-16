const CESIUM_ION_TOKEN =
	typeof window !== "undefined" && window.CESIUM_ION_TOKEN
		? window.CESIUM_ION_TOKEN
		: "PASTE_CESIUM_ION_TOKEN";
const BING_MAPS_KEY =
	typeof window !== "undefined" && window.BING_MAPS_KEY
		? window.BING_MAPS_KEY
		: "PASTE_BING_MAPS_KEY";

const straits = [
	{ id: "hurmuz", name: "Hormuz", coords: [56.3, 26.6] },
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
		useBrowserRecommendedResolution: false
	});


    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500000;
    

    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 25000000;

	viewer.imageryLayers.removeAll();
	viewer.imageryLayers.addImageryProvider(
		await Cesium.IonImageryProvider.fromAssetId(3812)
	);

	const loadingEl = document.createElement("div");
	loadingEl.className = "globe-loading";
	loadingEl.innerHTML = '<div class="globe-loading-spinner"></div>';
	viewer.container.appendChild(loadingEl);

	viewer.resolutionScale = window.devicePixelRatio;
	viewer.scene.globe.enableLighting = false;
	viewer.scene.backgroundColor = Cesium.Color.BLACK;
	viewer.scene.globe.baseColor = Cesium.Color.BLACK;
	viewer.scene.skyBox.show = false;
	viewer.scene.sun.show = false;
	viewer.scene.moon.show = false;

	const scratchNorm = new Cesium.Cartesian3();
	const scratchCam = new Cesium.Cartesian3();
	const overlays = [];

	straits.forEach((strait, i) => {
		const worldPos = Cesium.Cartesian3.fromDegrees(strait.coords[0], strait.coords[1], 5000);

		viewer.entities.add({
			id: strait.id,
			position: worldPos,
			point: {
				pixelSize: 9,
				color: Cesium.Color.fromCssColorString("#8fd3ff"),
				outlineColor: Cesium.Color.fromCssColorString("rgba(255,255,255,0.45)"),
				outlineWidth: 1.5,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			}
		});

		const pulseWrap = document.createElement("div");
		pulseWrap.className = "globe-pulse-wrap";
		const pulseRing = document.createElement("div");
		pulseRing.className = "globe-pulse";
		pulseRing.style.animationDelay = `${(i * 0.45).toFixed(2)}s`;
		pulseWrap.appendChild(pulseRing);
		viewer.container.appendChild(pulseWrap);

		const labelWrap = document.createElement("div");
		labelWrap.className = "globe-label-wrap";
		const labelLink = document.createElement("a");
		labelLink.className = "globe-label";
		labelLink.href = `${strait.id}.html`;
		labelLink.textContent = strait.name;
		labelWrap.appendChild(labelLink);
		viewer.container.appendChild(labelWrap);

		overlays.push({ worldPos, pulseWrap, labelWrap });
	});

	viewer.scene.postRender.addEventListener(() => {
		Cesium.Cartesian3.normalize(viewer.scene.camera.positionWC, scratchCam);

		overlays.forEach(({ worldPos, pulseWrap, labelWrap }) => {
			Cesium.Cartesian3.normalize(worldPos, scratchNorm);
			const facing = Cesium.Cartesian3.dot(scratchNorm, scratchCam);
			const visible = facing > 0.08;

			const canvasPos = viewer.scene.cartesianToCanvasCoordinates(worldPos);

			if (!canvasPos || !visible) {
				pulseWrap.style.opacity = "0";
				labelWrap.style.opacity = "0";
				labelWrap.style.pointerEvents = "none";
				return;
			}

			pulseWrap.style.left = canvasPos.x + "px";
			pulseWrap.style.top = canvasPos.y + "px";
			pulseWrap.style.opacity = "1";

			labelWrap.style.left = canvasPos.x + "px";
			labelWrap.style.top = (canvasPos.y - 18) + "px";
			labelWrap.style.opacity = "1";
			labelWrap.style.pointerEvents = "all";
		});
	});

	let autoRotate = true;
	let dragTimeout;
	viewer.scene.preRender.addEventListener(() => {
		if (autoRotate) {
			viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.005);
		}
	});
	viewer.scene.canvas.addEventListener("mousedown", () => {
		autoRotate = false;
		clearTimeout(dragTimeout);
	});
	viewer.scene.canvas.addEventListener("mouseup", () => {
		dragTimeout = setTimeout(() => { autoRotate = true; }, 2000);
	});
	viewer.scene.canvas.addEventListener("touchstart", () => {
		autoRotate = false;
		clearTimeout(dragTimeout);
	}, { passive: true });
	viewer.scene.canvas.addEventListener("touchend", () => {
		dragTimeout = setTimeout(() => { autoRotate = true; }, 2000);
	});

	let dismissed = false;
	function dismissLoader() {
		if (dismissed || !viewer.scene.globe.tilesLoaded) return;
		dismissed = true;
		loadingEl.classList.add("fade-out");
		setTimeout(() => loadingEl.remove(), 900);
	}
	viewer.scene.globe.tileLoadProgressEvent.addEventListener(dismissLoader);
	viewer.scene.postRender.addEventListener(dismissLoader);

	// ── Sidebar navigation ──
	const listEl = document.getElementById("strait-list");

	function flyToStrait(straitId) {
		const strait = straits.find((s) => s.id === straitId);
		if (!strait) return;
		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(strait.coords[0], strait.coords[1], 2200000),
			duration: 1.8
		});
	}

	function flyToGlobal() {
		viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
			duration: 2.0
		});
	}

	if (listEl) {
		const globalLink = document.createElement("a");
		globalLink.href = "global.html";
		globalLink.className = "strait-link is-active";
		globalLink.textContent = "Global";
		globalLink.addEventListener("click", (e) => {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			e.preventDefault();

			autoRotate = false;
        clearTimeout(dragTimeout);

			listEl.querySelectorAll(".strait-link").forEach((el) => el.classList.remove("is-active"));
			globalLink.classList.add("is-active");
			flyToGlobal();
		});
		listEl.appendChild(globalLink);

		straits.forEach((strait) => {
			const link = document.createElement("a");
			link.href = `${strait.id}.html`;
			link.className = "strait-link";
			link.textContent = strait.name;
			link.addEventListener("click", (e) => {
				if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
				e.preventDefault();

				autoRotate = false;
            clearTimeout(dragTimeout);

				listEl.querySelectorAll(".strait-link").forEach((el) => el.classList.remove("is-active"));
				link.classList.add("is-active");
				flyToStrait(strait.id);
			});
			listEl.appendChild(link);
		});
	}

	viewer.flyTo(viewer.entities, { duration: 2.2 });
}

initGlobe();

