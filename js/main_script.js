// Import delle variabili globali e dei riferimenti agli elementi del DOM
import {
    gridOpere, // Riferimento alla griglia di visualizzazione delle opere
    reloadButton, // Riferimento al pulsante per ricaricare la pagina
} from './functions.js'

// Import delle funzioni principali
import {
    fetchOpere, // Funzione per recuperare i dati delle opere da un file JSON
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

    // Recupera i dati dalle risorse JSON. La funzione fetchOpere restituisce i dati delle opere.
    fetchOpere();
    const opere = await fetchOpere(); // Attende che i dati siano caricati
    console.log("Opere caricate:", opere); // Stampa i dati delle opere nel console log per il debug

    // *****************************************************************************************
    // PROCESSO PRINCIPALE: Carica le opere, visualizza la galleria e aggiungi l'interattività
    // *****************************************************************************************

    if (opere.length > 0) { // Se sono state caricate opere
        // Seleziona un numero casuale di opere da mostrare nella griglia
        const randomOpere = getRandomOpere(opere);

        // Crea le carte HTML per ciascuna delle opere selezionate
        const operaCards = await Promise.all(randomOpere.map(createOperaCard));

        // Inserisce le carte delle opere all'interno della griglia
        gridOpere.innerHTML = operaCards.join("");

        // Uniforma l'altezza delle immagini orizzontali nella griglia
        setTimeout(adjustHorizontalImages(gridOpere), 100);

        // Aggiungi l'interattività per il click sulle immagini delle opere
        const images = gridOpere.querySelectorAll("img"); // Seleziona tutte le immagini nella griglia
        images.forEach(img => {
            img.addEventListener("click", (event) => {
                // Estrae i dati dell'opera associata all'immagine cliccata
                const operaData = event.target.getAttribute("data-opera");
                if (operaData) {
                    try {
                        // Parsing dei dati JSON dell'opera e visualizza il modale con i dettagli
                        const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                        showModal(opera); // Mostra il modale con i dettagli dell'opera
                    } catch (error) {
                        console.error("Errore nel parsing dei dati:", error); // Gestione errori di parsing
                    }
                }
            });
        });
    } else {
        // Se non ci sono opere disponibili, mostra un messaggio di avviso
        gridOpere.innerHTML = `<p>Nessuna opera disponibile.</p>`;
    }

    // Gestione del pulsante per ricaricare la pagina e mostrare un nuovo set di opere
    reloadButton.addEventListener("click", () => {
        window.scrollTo(0, 0); // Torna all'inizio della pagina
        location.reload(); // Ricarica la pagina
    });

    // Inizializza il menu hamburger
    initHamburgerMenu();

});