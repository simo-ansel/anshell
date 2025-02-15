// Import delle variabili globali e dei riferimenti agli elementi del DOM
import {
    gridOpere, // Riferimento alla griglia di visualizzazione delle opere
    reloadButton, // Riferimento al pulsante per ricaricare la pagina
} from './functions.js'

// Import delle funzioni principali
import {
    fetchOpere, // Funzione per recuperare i dati delle opere da un file JSON
    setLoadingBar, // Funzione per la barra di caricamento
    getRandomOpere, // Funzione per selezionare casualmente un numero definito di opere
    createOperaCard, // Funzione per creare la carta HTML di ogni opera
    adjustHorizontalImages, // Funzione per uniformare l'altezza delle immagini orizzontali
    showModal, // Funzione per mostrare un modale con i dettagli di un'opera
    initHamburgerMenu
} from './functions.js';

/*
 * Anshell - Biblioteca Personale
 * Creatore: Simone Anselmi aka Anshell
 * Descrizione: Questo script carica i dati da file JSON relativi a diverse opere (anime, libri, manga, serie TV, videogiochi)
 *              e li mostra in una griglia. Ogni opera è interattiva con un modale che mostra i dettagli.
 *              Include anche un pulsante per ricaricare la sezione e visualizzare un nuovo set di 6 opere.
 */

// Il codice viene eseguito quando il DOM è completamente caricato
document.addEventListener("DOMContentLoaded", async () => {
    // Recupera i dati dalle risorse JSON
    const opere = await fetchOpere(); // Attende che i dati siano caricati
    console.log("Opere caricate:", opere); // Stampa i dati delle opere nel console log per il debug

    if (opere.length > 0) { // Se ci sono opere disponibili
        const randomOpere = getRandomOpere(opere); // Seleziona un numero casuale di opere da mostrare
        const operaCards = await Promise.all(randomOpere.map(createOperaCard));

        gridOpere.innerHTML = operaCards.join(""); // Inserisce le carte delle opere nella griglia

        // Uniforma l'altezza delle immagini orizzontali
        setTimeout(adjustHorizontalImages(gridOpere), 100);

        // Seleziona tutte le immagini nella griglia
        const images = gridOpere.querySelectorAll("img");
        let loadedImages = 0;

        setLoadingBar(); // Avvia la barra di caricamento
        // Funzione per aggiornare la barra di caricamento
        function updateLoadingBar() {
            let progress = (loadedImages / images.length) * 100;
            document.getElementById("loading-bar").style.width = progress + "%";
            if (loadedImages === images.length) {
                setTimeout(() => {
                    document.getElementById("loading-bar-container").style.display = "none"; // Nascondi la barra
                }, 500);
            }
        }

        // Funzione per monitorare ogni immagine
        images.forEach(img => {
            if (img.complete) {
                loadedImages++;
                updateLoadingBar(); // Se l'immagine è già caricata
            } else {
                img.onload = img.onerror = () => {
                    loadedImages++;
                    updateLoadingBar(); // Aggiorna la barra ogni volta che un'immagine viene caricata
                };
            }
        });

        // Aggiungi l'interattività per il click sulle immagini delle opere
        images.forEach(img => {
            img.addEventListener("click", (event) => {
                const operaData = event.target.getAttribute("data-opera");
                if (operaData) {
                    try {
                        const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                        showModal(opera); // Mostra il modale con i dettagli dell'opera
                    } catch (error) {
                        console.error("Errore nel parsing dei dati:", error);
                    }
                }
            });
        });
    } else {
        gridOpere.innerHTML = `<p>Nessuna opera disponibile.</p>`; // Messaggio se non ci sono opere
    }

    // Gestione del pulsante per ricaricare la pagina
    reloadButton.addEventListener("click", () => {
        window.scrollTo(0, 0); // Torna all'inizio
        location.reload(); // Ricarica la pagina
    });

    // Inizializza il menu hamburger
    initHamburgerMenu();
});
