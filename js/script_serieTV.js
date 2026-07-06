/*
 * =========================================================================================
 *  ANSHELL – Biblioteca Personale
 *  File: script_serieTV.js
 *
 *  Gestione:
 *  - caricamento serie TV
 *  - filtri (ricerca, generi a chip multi-selezione, ordinamento)
 *  - rendering griglia
 *  - modale
 * =========================================================================================
 */

/* =========================================================================================
 * IMPORT
 * ========================================================================================= */

import { gridOpere } from './functions.js';

import {
    fetchOpere,
    setLoadingBar,
    createOperaCard,
    adjustHorizontalImages,
    showModal,
    initHamburgerMenu,
    matchesSearch,
    matchesGenereMulti,
    populateGenereChips,
    resetFiltri,
    sortItems
} from './functions.js';

/* =========================================================================================
 * STATO
 * ========================================================================================= */

let serieTVData = [];
let filteredData = [];

const filters = {
    search: "",
    generi: new Set(),
    ordine: "titolo-asc"
};

/* =========================================================================================
 * DOM – FILTRI
 * ========================================================================================= */

const searchInput    = document.getElementById("search-input");
const chipsContainer = document.getElementById("genere-chips");
const ordineSelect   = document.getElementById("ordine-select");
const resetButton    = document.getElementById("reset-filtri");

/* =========================================================================================
 * INIT
 * ========================================================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    serieTVData = await fetchOpere({ fileName: "serieTV.json" });
    filteredData = serieTVData;

    populateGenereChips(chipsContainer, serieTVData, filters, applyFilters);
    await renderGrid(filteredData);

    initFilterEvents();
    initHamburgerMenu();
});

/* =========================================================================================
 * FILTRI
 * ========================================================================================= */

function applyFilters() {
    filteredData = serieTVData.filter(item =>
        matchesSearch(item, filters.search) &&
        matchesGenereMulti(item, filters.generi)
    );

    filteredData = sortItems(filteredData, filters.ordine);
    renderGrid(filteredData);
}

function initFilterEvents() {

    searchInput.addEventListener("input", e => {
        filters.search = e.target.value;
        applyFilters();
    });

    ordineSelect.addEventListener("change", e => {
        filters.ordine = e.target.value;
        applyFilters();
    });

    resetButton?.addEventListener("click", () => {
        resetFiltri(filters, { searchInput, ordineSelect, chipsContainer });
        applyFilters();
    });
}

/* =========================================================================================
 * RENDERING
 * ========================================================================================= */

async function renderGrid(data) {

    if (!data.length) {
        gridOpere.innerHTML = `<p>Nessuna serie TV trovata.</p>`;
        return;
    }

    const cards = await Promise.all(data.map(createOperaCard));
    gridOpere.innerHTML = cards.join("");

    setTimeout(() => adjustHorizontalImages(gridOpere), 50);

    handleImagesLoading();
    bindModalEvents();
}

/* =========================================================================================
 * LOADING BAR
 * ========================================================================================= */

function handleImagesLoading() {

    const images = gridOpere.querySelectorAll("img");
    let loadedImages = 0;

    setLoadingBar();

    function updateLoadingBar() {
        const progress = (loadedImages / images.length) * 100;
        document.getElementById("loading-bar").style.width = progress + "%";

        if (loadedImages === images.length) {
            setTimeout(() => {
                document.getElementById("loading-bar-container").style.display = "none";
            }, 500);
        }
    }

    images.forEach(img => {
        if (img.complete) {
            loadedImages++;
            updateLoadingBar();
        } else {
            img.onload = img.onerror = () => {
                loadedImages++;
                updateLoadingBar();
            };
        }
    });
}

/* =========================================================================================
 * MODALE
 * ========================================================================================= */

function bindModalEvents() {

    const images = gridOpere.querySelectorAll("img");

    images.forEach(img => {
        img.addEventListener("click", event => {
            const operaData = event.target.getAttribute("data-opera");
            if (!operaData) return;

            try {
                const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                showModal(opera);
            } catch (err) {
                console.error("Errore parsing dati opera:", err);
            }
        });
    });
}
