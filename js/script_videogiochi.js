// Import delle variabili globali per il riferimento agli elementi del DOM
import {
    gridOpere, // Riferimento alla griglia dove verranno mostrate le opere (videogiochi)
} from './functions.js'

// Import delle funzioni per la gestione delle opere
import {
    fetchOpere, // Funzione per recuperare i dati da un file JSON
    createOperaCard, // Funzione per creare la carta HTML per ogni opera
    adjustHorizontalImages, // Funzione per uniformare l'altezza delle immagini orizzontali
    showModal, // Funzione per mostrare il modale con i dettagli di ogni opera
    initHamburgerMenu
} from './functions.js';

/*
 * Anshell - Biblioteca Personale
 * Creato da Simone Anselmi aka Anshell
 * Descrizione: Script per caricare i dati sui videogiochi da un file JSON e visualizzarli in una galleria interattiva.
 *              Ogni videogioco è cliccabile e apre un modale che permette di esplorare i dettagli.
 */

// Il codice viene eseguito quando il DOM è completamente caricato
document.addEventListener("DOMContentLoaded", async () => {

    // Recupera i dati dal file JSON specificato (in questo caso "videogiochi.json")
    const videogiochi = await fetchOpere({
        fileName: "videogiochi.json" // Specifica il file da cui caricare i dati delle opere (videogiochi)
    });
    console.log("Videogiochi caricati:", videogiochi); // Log per verificare i dati caricati correttamente

    // *****************************************************************************************
    // PROCESSO PRINCIPALE: Carica le opere, visualizza la galleria e aggiungi l'interattività
    // *****************************************************************************************
    
    if (videogiochi.length > 0) { // Se ci sono videogiochi disponibili

        // Crea le carte HTML per ciascuna opera (videogioco)
        const operaCards = await Promise.all(videogiochi.map(createOperaCard));

        // Inserisce le carte create nella griglia delle opere
        gridOpere.innerHTML = operaCards.join("");

        // Allinea le immagini orizzontali nella griglia dopo che il contenuto è stato caricato
        setTimeout(adjustHorizontalImages(gridOpere), 100); // Attende un breve intervallo per completare il rendering

        // Aggiungi un evento di click per aprire il modale quando si clicca su un'immagine
        const images = gridOpere.querySelectorAll("img"); // Seleziona tutte le immagini delle opere
        images.forEach(img => {
            img.addEventListener("click", event => {
                // Estrai i dati dell'opera associata all'immagine cliccata
                const operaData = event.target.getAttribute("data-opera");
                if (!operaData) {
                    console.error("Dati dell'opera non trovati."); // Se i dati non sono disponibili, logga un errore
                    return;
                }
                try {
                    // Parsing dei dati JSON dell'opera
                    const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                    console.log("Opera selezionata:", opera); // Log dell'opera selezionata
                    showModal(opera); // Mostra il modale con i dettagli dell'opera
                } catch (error) {
                    console.error("Errore nel parsing dei dati dell'opera:", error); // Gestione degli errori di parsing
                }
            });
        });
    } else {
        // Se non ci sono opere (videogiochi) disponibili, mostra un messaggio di errore
        gridOpere.innerHTML = `<p>Nessuna opera disponibile.</p>`;
    }

    // Inizializza il menu hamburger
    initHamburgerMenu();
});