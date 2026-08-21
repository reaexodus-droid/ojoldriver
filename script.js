// ======================================================
// GOOGLE MAPS DRIVER APP
// ======================================================


// ======================================================
// GLOBAL
// ======================================================

let map;

let AdvancedMarkerElement;

let userMarker = null;

let selectedMarker = null;

let selectedPlaceMarker = null;

let accuracyCircle = null;

let watchId = null;

let tracking = false;

let selectedPlace = null;


// ======================================================
// INIT
// ======================================================

async function initMap() {

    // Ambil library marker

    const markerLibrary =
        await google.maps.importLibrary("marker");

    AdvancedMarkerElement =
        markerLibrary.AdvancedMarkerElement;


    // ==================================================
    // MAP
    // ==================================================

    map = new google.maps.Map(
        document.getElementById("map"),
        {

            center: {
                lat: -6.2088,
                lng: 106.8456
            },

            zoom: 13,

            mapTypeControl: false,

            streetViewControl: false,

            fullscreenControl: true,

            zoomControl: true,

            gestureHandling: "greedy",

            clickableIcons: true

        }
    );


    // ==================================================
    // SEARCH
    // ==================================================

    createSearch();


    // ==================================================
    // CLICK MAP
    // ==================================================

    map.addListener(
        "click",
        handleMapClick
    );


    // ==================================================
    // BUTTONS
    // ==================================================

    setupButtons();


    // ==================================================
    // PLACE INFO CLOSE
    // ==================================================

    document
        .getElementById("close-place")
        .addEventListener(
            "click",
            () => {

                hidePlaceCard();

            }
        );


    // ==================================================
    // SAVE POINT
    // ==================================================

    document
        .getElementById("save-point")
        .addEventListener(
            "click",
            savePoint
        );


    // ==================================================
    // LOAD SAVED POINTS
    // ==================================================

    loadSavedPoints();

}


// ======================================================
// SEARCH GOOGLE MAPS
// ======================================================

async function createSearch() {

    const placesLibrary =
        await google.maps.importLibrary(
            "places"
        );


    const PlaceAutocompleteElement =
        placesLibrary.PlaceAutocompleteElement;


    const autocomplete =
        new PlaceAutocompleteElement();


    autocomplete.placeholder =
        "Cari tempat atau alamat...";


    autocomplete.setAttribute(
        "included-region-codes",
        "id"
    );


    document
        .getElementById(
            "search-container"
        )
        .appendChild(
            autocomplete
        );


    // ==================================================
    // PLACE SELECT
    // ==================================================

    autocomplete.addEventListener(
        "gmp-select",
        async (event) => {

            try {

                const place =
                    event.place;


                await place.fetchFields({

                    fields: [
                        "displayName",
                        "formattedAddress",
                        "location",
                        "id"
                    ]

                });


                if (!place.location) {

                    alert(
                        "Lokasi tempat tidak tersedia."
                    );

                    return;

                }


                const lat =
                    place.location.lat();


                const lng =
                    place.location.lng();


                selectedPlace = {

                    id: place.id || "",

                    name:
                        place.displayName || "Lokasi",

                    address:
                        place.formattedAddress || "",

                    lat,

                    lng

                };


                // ==================================================
                // MOVE MAP
                // ==================================================

                map.panTo({

                    lat,

                    lng

                });


                map.setZoom(17);


                // ==================================================
                // REMOVE OLD SEARCH MARKER
                // ==================================================

                if (
                    selectedPlaceMarker
                ) {

                    selectedPlaceMarker.map =
                        null;

                }


                // ==================================================
                // CREATE SEARCH MARKER
                // ==================================================

                selectedPlaceMarker =
                    createMarker(

                        {

                            lat,

                            lng

                        },

                        "#dc2626"

                    );


                // ==================================================
                // SHOW PLACE INFO
                // ==================================================

                showPlaceCard(
                    selectedPlace
                );


            }

            catch (error) {

                console.error(
                    "Place error:",
                    error
                );

                alert(
                    "Gagal mengambil detail lokasi."
                );

            }

        }
    );

}


// ======================================================
// CREATE MARKER
// ======================================================

function createMarker(
    position,
    color = "#2563eb"
) {

    const markerElement =
        document.createElement(
            "div"
        );


    markerElement.style.width =
        "24px";

    markerElement.style.height =
        "24px";

    markerElement.style.borderRadius =
        "50%";

    markerElement.style.background =
        color;

    markerElement.style.border =
        "4px solid white";

    markerElement.style.boxShadow =
        "0 2px 8px rgba(0,0,0,.35)";


    const marker =
        new AdvancedMarkerElement({

            map,

            position,

            content:
                markerElement

        });


    return marker;

}


// ======================================================
// CLICK MAP
// ======================================================

function handleMapClick(event) {

    const lat =
        event.latLng.lat();

    const lng =
        event.latLng.lng();


    // ==================================================
    // PANEL
    // ==================================================

    document
        .getElementById("point-panel")
        .classList
        .remove("hidden");


    // ==================================================
    // INPUT
    // ==================================================

    document
        .getElementById("lat")
        .value =
        lat.toFixed(6);


    document
        .getElementById("lng")
        .value =
        lng.toFixed(6);


    // ==================================================
    // REMOVE OLD SELECTED MARKER
    // ==================================================

    if (selectedMarker) {

        selectedMarker.map =
            null;

    }


    // ==================================================
    // NEW SELECTED MARKER
    // ==================================================

    selectedMarker =
        createMarker(

            {

                lat,

                lng

            },

            "#2563eb"

        );

}


// ======================================================
// SAVE POINT
// ======================================================

function savePoint() {

    const nama =
        document
            .getElementById("nama")
            .value
            .trim();


    const lat =
        parseFloat(
            document
                .getElementById("lat")
                .value
        );


    const lng =
        parseFloat(
            document
                .getElementById("lng")
                .value
        );


    const status =
        document
            .getElementById("status")
            .value;


    const ket =
        document
            .getElementById("ket")
            .value
            .trim();


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!nama) {

        alert(
            "Nama lokasi belum diisi."
        );

        return;

    }


    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {

        alert(
            "Klik lokasi pada peta terlebih dahulu."
        );

        return;

    }


    // ==================================================
    // MARKER COLOR
    // ==================================================

    let color =
        "#ef4444";


    if (
        status === "Asli"
    ) {

        color =
            "#22c55e";

    }


    if (
        status === "Survey"
    ) {

        color =
            "#3b82f6";

    }


    // ==================================================
    // CREATE MARKER
    // ==================================================

    const marker =
        createMarker(

            {

                lat,

                lng

            },

            color

        );


    // ==================================================
    // INFO WINDOW
    // ==================================================

    const infoWindow =
        new google.maps.InfoWindow({

            content: createPointHTML({

                nama,

                status,

                lat,

                lng,

                ket

            })

        });


    marker.addListener(
        "click",
        () => {

            infoWindow.open({

                map,

                anchor:
                    marker

            });

        }
    );


    // ==================================================
    // SAVE LOCAL
    // ==================================================

    const point = {

        id:
            Date.now(),

        nama,

        lat,

        lng,

        status,

        ket

    };


    savePointLocal(point);


    // ==================================================
    // REMOVE TEMP MARKER
    // ==================================================

    if (selectedMarker) {

        selectedMarker.map =
            null;

        selectedMarker =
            null;

    }


    // ==================================================
    // RESET FORM
    // ==================================================

    resetPointForm();


    alert(
        "Titik berhasil disimpan."
    );

}


// ======================================================
// CREATE POPUP HTML
// ======================================================

function createPointHTML(point) {

    return `

        <div style="
            min-width:220px;
            padding:5px;
        ">

            <div style="
                font-size:18px;
                font-weight:bold;
                margin-bottom:8px;
            ">

                ${escapeHTML(point.nama)}

            </div>


            <div>

                <b>Status:</b>

                ${escapeHTML(point.status)}

            </div>


            <div style="
                margin-top:5px;
            ">

                <b>Latitude:</b>

                ${point.lat.toFixed(6)}

            </div>


            <div>

                <b>Longitude:</b>

                ${point.lng.toFixed(6)}

            </div>


            ${
                point.ket
                ?
                `

                <div style="
                    margin-top:8px;
                ">

                    <b>Keterangan:</b>

                    <br>

                    ${escapeHTML(point.ket)}

                </div>

                `
                :
                ""
            }

        </div>

    `;

}


// ======================================================
// SHOW PLACE CARD
// ======================================================

function showPlaceCard(place) {

    document
        .getElementById("place-name")
        .textContent =
        place.name;


    document
        .getElementById("place-address")
        .textContent =
        place.address;


    document
        .getElementById("place-lat")
        .textContent =
        place.lat.toFixed(6);


    document
        .getElementById("place-lng")
        .textContent =
        place.lng.toFixed(6);


    document
        .getElementById("place-info")
        .classList
        .remove("hidden");


    // ==================================================
    // USE PLACE
    // ==================================================

    document
        .getElementById("use-place")
        .onclick =
        () => {

            document
                .getElementById("point-panel")
                .classList
                .remove("hidden");


            document
                .getElementById("nama")
                .value =
                place.name;


            document
                .getElementById("lat")
                .value =
                place.lat.toFixed(6);


            document
                .getElementById("lng")
                .value =
                place.lng.toFixed(6);


            if (selectedMarker) {

                selectedMarker.map =
                    null;

            }


            selectedMarker =
                createMarker(

                    {

                        lat:
                            place.lat,

                        lng:
                            place.lng

                    },

                    "#2563eb"

                );


            hidePlaceCard();

        };

}


// ======================================================
// HIDE PLACE CARD
// ======================================================

function hidePlaceCard() {

    document
        .getElementById("place-info")
        .classList
        .add("hidden");

}


// ======================================================
// GPS BUTTON
// ======================================================

function setupButtons() {

    document
        .getElementById("location-btn")
        .addEventListener(
            "click",
            locateUser
        );


    document
        .getElementById("add-point-btn")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "point-panel"
                    )
                    .classList
                    .remove("hidden");

            }
        );


    document
        .getElementById("close-panel")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "point-panel"
                    )
                    .classList
                    .add("hidden");

            }
        );

}


// ======================================================
// GET USER LOCATION
// ======================================================

function locateUser() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Browser tidak mendukung GPS."
        );

        return;

    }


    setGPSStatus(
        "Mencari lokasi...",
        false
    );


    navigator.geolocation.getCurrentPosition(

        position => {

            updateUserPosition(
                position
            );


            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            map.animateCamera({

                center: {

                    lat,

                    lng

                },

                zoom: 17

            });


            startTracking();

        },


        error => {

            console.error(
                error
            );


            setGPSStatus(
                "GPS gagal",
                false
            );


            alert(
                getGPSErrorMessage(
                    error
                )
            );

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                0

        }

    );

}


// ======================================================
// START TRACKING
// ======================================================

function startTracking() {

    if (
        tracking
    ) {

        return;

    }


    tracking =
        true;


    watchId =
        navigator.geolocation.watchPosition(

            position => {

                updateUserPosition(
                    position
                );

            },


            error => {

                console.error(
                    "Tracking:",
                    error
                );

            },


            {

                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    2000

            }

        );

}


// ======================================================
// STOP TRACKING
// ======================================================

function stopTracking() {

    if (
        watchId !== null
    ) {

        navigator.geolocation
            .clearWatch(
                watchId
            );

    }


    watchId =
        null;

    tracking =
        false;

}


// ======================================================
// UPDATE USER POSITION
// ======================================================

function updateUserPosition(
    position
) {

    const lat =
        position.coords.latitude;

    const lng =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    // ==================================================
    // USER MARKER
    // ==================================================

    if (!userMarker) {

        userMarker =
            createDriverMarker({

                lat,

                lng

            });

    }

    else {

        userMarker.position = {

            lat,

            lng

        };

    }


    // ==================================================
    // ACCURACY
    // ==================================================

    updateAccuracyCircle(
        lat,
        lng,
        accuracy
    );


    // ==================================================
    // GPS STATUS
    // ==================================================

    setGPSStatus(
        `GPS aktif • ±${Math.round(accuracy)} m`,
        true
    );

}


// ======================================================
// DRIVER MARKER
// ======================================================

function createDriverMarker(
    position
) {

    const element =
        document.createElement(
            "div"
        );


    element.style.width =
        "22px";

    element.style.height =
        "22px";

    element.style.borderRadius =
        "50%";

    element.style.background =
        "#4285F4";

    element.style.border =
        "4px solid white";

    element.style.boxShadow =
        `
        0 2px 8px
        rgba(0,0,0,.35)
        `;


    const marker =
        new AdvancedMarkerElement({

            map,

            position,

            title:
                "Lokasi Anda",

            content:
                element

        });


    return marker;

}


// ======================================================
// GPS ACCURACY CIRCLE
// ======================================================

function updateAccuracyCircle(
    lat,
    lng,
    radius
) {

    if (!accuracyCircle) {

        accuracyCircle =
            new google.maps.Circle({

                map,

                center: {

                    lat,

                    lng

                },

                radius,

                fillColor:
                    "#4285F4",

                fillOpacity:
                    0.12,

                strokeColor:
                    "#4285F4",

                strokeOpacity:
                    0.35,

                strokeWeight:
                    1,

                clickable:
                    false

            });

    }

    else {

        accuracyCircle.setCenter({

            lat,

            lng

        });


        accuracyCircle.setRadius(
            radius
        );

    }

}


// ======================================================
// GPS STATUS
// ======================================================

function setGPSStatus(
    text,
    active
) {

    document
        .getElementById(
            "gps-text"
        )
        .textContent =
        text;


    const status =
        document
            .getElementById(
                "gps-status"
            );


    if (active) {

        status.classList
            .add("active");

    }

    else {

        status.classList
            .remove("active");

    }

}


// ======================================================
// LOCAL STORAGE
// ======================================================

function savePointLocal(
    point
) {

    const points =
        getSavedPoints();


    points.push(point);


    localStorage.setItem(

        "driver_maps_points",

        JSON.stringify(points)

    );

}


// ======================================================
// GET SAVED POINTS
// ======================================================

function getSavedPoints() {

    try {

        return JSON.parse(

            localStorage.getItem(
                "driver_maps_points"
            )

        ) || [];

    }

    catch {

        return [];

    }

}


// ======================================================
// LOAD SAVED POINTS
// ======================================================

function loadSavedPoints() {

    const points =
        getSavedPoints();


    points.forEach(
        point => {

            addSavedMarker(
                point
            );

        }
    );

}


// ======================================================
// ADD SAVED MARKER
// ======================================================

function addSavedMarker(
    point
) {

    let color =
        "#ef4444";


    if (
        point.status === "Asli"
    ) {

        color =
            "#22c55e";

    }


    if (
        point.status === "Survey"
    ) {

        color =
            "#3b82f6";

    }


    const marker =
        createMarker(

            {

                lat:
                    point.lat,

                lng:
                    point.lng

            },

            color

        );


    const infoWindow =
        new google.maps.InfoWindow({

            content:
                createPointHTML(
                    point
                )

        });


    marker.addListener(
        "click",
        () => {

            infoWindow.open({

                map,

                anchor:
                    marker

            });

        }
    );

}


// ======================================================
// RESET FORM
// ======================================================

function resetPointForm() {

    document
        .getElementById("nama")
        .value =
        "";


    document
        .getElementById("lat")
        .value =
        "";


    document
        .getElementById("lng")
        .value =
        "";


    document
        .getElementById("ket")
        .value =
        "";


    document
        .getElementById("status")
        .value =
        "Fiktif";


    document
        .getElementById("point-panel")
        .classList
        .add("hidden");

}


// ======================================================
// GPS ERROR
// ======================================================

function getGPSErrorMessage(
    error
) {

    switch (
        error.code
    ) {

        case 1:

            return (
                "Izin lokasi ditolak. " +
                "Izinkan browser mengakses lokasi Anda."
            );


        case 2:

            return (
                "Lokasi tidak tersedia."
            );


        case 3:

            return (
                "GPS timeout. " +
                "Coba lagi."
            );


        default:

            return (
                "Tidak dapat mendapatkan lokasi."
            );

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ======================================================
// START
// ======================================================

window.addEventListener(
    "load",
    initMap
);