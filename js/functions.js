/*
 * Anshell - Biblioteca Personale
 *
 * Creato da Simone Anselmi aka Anshell
 *
 * Descrizione: Script per caricare i dati su videogiochi da un file JSON e visualizzarli in una galleria interattiva, 
 *              completa di un modale che permette di esplorare i dettagli di ogni opera.
 */

// ***********************************************************************
// INIZIALIZZAZIONE VARIABILI E RIFERIMENTI AL DOM
// ***********************************************************************

/*
 * Riferimento alla griglia HTML dove verranno visualizzate le opere.
 * Questa variabile rappresenta l'elemento con l'ID "grid-opere" nel DOM.
 */
export const gridOpere = document.getElementById("grid-opere"); // Griglia per le opere

/*
 * Riferimento al modale (finestra modale) HTML utilizzato per visualizzare i dettagli di un'opera.
 * Questa variabile rappresenta l'elemento con l'ID "modal" nel DOM.
 */
export const modal = document.getElementById("modal"); // Modale per visualizzare i dettagli

/*
 * Riferimento al contenuto all'interno del modale, che verrà aggiornato dinamicamente.
 * Viene selezionato l'elemento con la classe "modal-content" nel DOM.
 */
export const modalContent = document.querySelector('.modal-content'); // Contenuto del modale

/*
 * Riferimento al pulsante HTML utilizzato per ricaricare la pagina.
 * Questa variabile rappresenta l'elemento con l'ID "reload-button" nel DOM.
 */
export const reloadButton = document.getElementById("reload-button"); // Pulsante per ricaricare la pagina

/* Seleziona il pulsante hamburger che attiva il menu */
const menuToggle = document.querySelector(".menu-toggle");

/* Seleziona la lista di navigazione (menu) */
const navList = document.querySelector(".nav-list");

/* Seleziona l'overlay che copre lo schermo quando il menu è aperto */
const overlay = document.querySelector(".nav-list-overlay");

// ***********************************************************************
// FUNZIONE: Recupera i dati dalle risorse JSON per il main script
// ***********************************************************************

/**
 * Recupera i dati delle opere (libri, anime, videogiochi, manga, serie TV) da file JSON.
 * Se viene fornito un nome di file specifico, carica solo quel file. In caso contrario,
 * carica più file JSON contemporaneamente e restituisce i dati combinati in un unico array.
 * 
 * @param {Object} options - Opzioni per personalizzare la funzione.
 * @param {string} [options.fileName=null] - Nome del file JSON da caricare (opzionale).
 * 
 * @returns {Array} Un array contenente i dati delle opere. Se si verifica un errore, restituisce un array vuoto.
 */
export async function fetchOpere(options = {}) {
    const {
        fileName = null
    } = options;

    // Calcoliamo il percorso base usando getImagePath
    const basePath = getImagePath('data/'); // Usa "data/" come directory base per i file JSON

    if (fileName) {
        // Se viene fornito un fileName, carica il singolo file JSON
        try {
            const response = await fetch(`${basePath}${fileName}`);
            if (!response.ok) throw new Error(`Errore nel caricamento del file: ${fileName}`);
            return await response.json();
        } catch (error) {
            console.error(`Errore durante il fetch di ${fileName}:`, error);
            return []; // Restituisce un array vuoto in caso di errore
        }
    } else {
        // Se non viene fornito un fileName, carica più file JSON contemporaneamente
        try {
            const [libriResponse, animeResponse, videogiochiResponse, mangaResponse, serieTVResponse] = await Promise.all([
                fetch(`${basePath}libri.json`),
                fetch(`${basePath}anime.json`),
                fetch(`${basePath}videogiochi.json`),
                fetch(`${basePath}manga.json`),
                fetch(`${basePath}serieTV.json`)
            ]);

            // Verifica la validità delle risposte
            if (!libriResponse.ok) throw new Error("Errore nel caricamento dei libri.");
            if (!animeResponse.ok) throw new Error("Errore nel caricamento degli anime.");
            if (!videogiochiResponse.ok) throw new Error("Errore nel caricamento dei videogiochi.");
            if (!mangaResponse.ok) throw new Error("Errore nel caricamento dei manga.");
            if (!serieTVResponse.ok) throw new Error("Errore nel caricamento delle serie TV.");

            // Parsing dei dati JSON
            const libriData = await libriResponse.json();
            const animeData = await animeResponse.json();
            const videogiochiData = await videogiochiResponse.json();
            const mangaData = await mangaResponse.json();
            const serieTVData = await serieTVResponse.json();

            // Combina tutti i dati in un unico array
            return [...libriData, ...animeData, ...videogiochiData, ...mangaData, ...serieTVData];
        } catch (error) {
            console.error("Errore durante il caricamento delle opere:", error);
            return []; // Restituisce un array vuoto in caso di errore
        }
    }
}

// ***********************************************************************
// FUNZIONE: Gestisce la barra di caricamento durante il processo di caricamento della pagina
// ***********************************************************************

/**
 * Questa funzione gestisce la barra di caricamento visualizzando un progresso dinamico 
 * mentre la pagina sta caricando. La barra si riempie gradualmente tramite un incremento 
 * casuale del progresso, simulando il caricamento di risorse. Una volta che il progresso 
 * raggiunge il 100%, la barra scompare.
 * 
 * La funzione utilizza un `setInterval` per aggiornare la barra di caricamento a intervalli regolari
 * e un `clearInterval` per fermare l'animazione al raggiungimento del 100% di completamento.
 * 
 * @returns {void} Non restituisce valori. Nasconde la barra di caricamento una volta completato il caricamento.
 */
export async function setLoadingBar() {
    let loadingBar = document.getElementById("loading-bar");
    let progress = 0;

    // Definisco l'interval prima di usarlo
    let interval;

    // Funzione che aggiorna il progresso
    function updateProgress() {
        progress += Math.random() * 10; // Incremento casuale per simulare il caricamento
        loadingBar.style.width = progress + "%";

        if (progress >= 100) {
            clearInterval(interval);  // Ora 'interval' è definito correttamente
            setTimeout(() => {
                document.getElementById("loading-bar-container").style.display = "none"; // Nascondi la barra
            }, 500);
        }
    }

    // Attendi che la pagina sia completamente caricata
    window.onload = function () {
        interval = setInterval(updateProgress, 100); // Assegno interval qui
    };
}

// ***********************************************************************
// FUNZIONE: Seleziona opere casuali da mostrare
// ***********************************************************************

/**
 * Seleziona un numero casuale di opere dalla lista fornita.
 * La funzione garantisce che le opere selezionate siano uniche (senza duplicati) e vengono restituite in un array.
 * 
 * @param {Array} opere - Un array contenente tutte le opere disponibili da cui selezionare.
 * @param {number} [count=6] - Il numero di opere casuali da selezionare (predefinito è 6).
 * 
 * @returns {Array} Un array contenente le opere selezionate casualmente. La lunghezza dell'array sarà
 *   pari al valore di `count`, ma non supererà il numero di opere disponibili.
 */
export function getRandomOpere(opere, count = 6) {
    // Array per memorizzare le opere selezionate
    const selected = [];

    // Set per tenere traccia degli indici già selezionati, evitando duplicati
    const indices = new Set();

    // Continuare finché non vengono selezionate 'count' opere uniche
    while (selected.length < count && indices.size < opere.length) {
        // Genera un indice casuale tra 0 e la lunghezza dell'array 'opere'
        const randomIndex = Math.floor(Math.random() * opere.length);

        // Se l'indice non è già stato selezionato, aggiungilo alla lista
        if (!indices.has(randomIndex)) {
            indices.add(randomIndex); // Aggiungi l'indice al set degli indici selezionati
            selected.push(opere[randomIndex]); // Aggiungi l'opera corrispondente alla lista delle selezionate
        }
    }

    // Restituisce l'array delle opere selezionate
    return selected;
}

// ***********************************************************************
// FUNZIONE: Calcola le dimensioni proporzionate dell'immagine
// ***********************************************************************

/**
 * Calcola le dimensioni ottimizzate (width e height) di un elemento in modo che si adatti
 * a una griglia di dimensioni predefinite, mantenendo le proporzioni originali.
 * La funzione restituirà anche gli offset necessari per centrare l'elemento nella griglia.
 * 
 * @param {number} width - La larghezza originale dell'elemento.
 * @param {number} height - L'altezza originale dell'elemento.
 * @param {number} [gridOpereWidth=420] - La larghezza della griglia di destinazione (opzionale, predefinito a 420).
 * @param {number} [gridOpereHeight=520] - L'altezza della griglia di destinazione (opzionale, predefinito a 520).
 * 
 * @returns {Object} Un oggetto contenente:
 *   - `width`: La larghezza regolata dell'elemento.
 *   - `height`: L'altezza regolata dell'elemento.
 *   - `offsetX`: L'offset orizzontale necessario per centrare l'elemento nella griglia.
 *   - `offsetY`: L'offset verticale necessario per centrare l'elemento nella griglia.
 */
export function getAdjustedDimensions(width, height, gridOpereWidth = 420, gridOpereHeight = 520) {
    const screenWidth = window.innerWidth;
    const widthRatio = gridOpereWidth / width;
    const heightRatio = gridOpereHeight / height;

    // Determina il fattore di scala in base alla larghezza dello schermo
    const scaleRatio = Math.min(widthRatio, heightRatio) *
        (screenWidth <= 480 ? 0.7 : screenWidth <= 768 ? 0.8 : 1);

    const adjustedWidth = Math.round(width * scaleRatio);
    const adjustedHeight = Math.round(height * scaleRatio);

    // Calcola gli offset per il centraggio
    const offsetX = Math.round((gridOpereWidth - adjustedWidth) / 2);
    const offsetY = Math.round((gridOpereHeight - adjustedHeight) / 2);

    return {
        width: adjustedWidth,
        height: adjustedHeight,
        offsetX,
        offsetY
    };
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto che trova il path delle immagini
// ***********************************************************************

/**
 * Funzione che calcola il percorso completo di un'immagine, a partire da un percorso relativo.
 * Se la pagina corrente si trova nella directory "/pages", la funzione rimuove "/pages"
 * dal percorso e aggiunge il relativo percorso dell'immagine.
 * Se la pagina non si trova nella directory "/pages", restituisce semplicemente il percorso
 * dell'immagine relativo così com'è.
 * 
 * @param {string} imageRelativePath - Il percorso relativo dell'immagine da risolvere.
 * 
 * @returns {string} Il percorso completo dell'immagine, che può essere assoluto o relativo
 *   a seconda della posizione della pagina corrente.
 */
export function getImagePath(imageRelativePath) {
    let currentPath = window.location.pathname; // Ottieni il percorso corrente della pagina

    if (currentPath.includes("/pages/")) {
        // Se il percorso contiene "/pages", rimuoviamo "/pages" e l'eventuale parte finale
        // (come un file HTML) e aggiungiamo il percorso relativo dell'immagine.
        currentPath = currentPath.replace("/pages", "").replace(/\/[^/]+$/, "") + "/" + imageRelativePath;
    } else {
        // Se la pagina non si trova in "/pages", restituiamo direttamente il percorso relativo dell'immagine.
        currentPath = imageRelativePath;
    }

    return currentPath; // Restituisce il percorso completo dell'immagine
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto per determinare l'orientamento dell'immagine
// ***********************************************************************

/**
 * Determina l'orientamento di un'immagine in base alle sue dimensioni.
 * Se la larghezza dell'immagine è maggiore della sua altezza, l'orientamento è orizzontale,
 * altrimenti l'orientamento è verticale.
 * 
 * @param {number} originalWidth - La larghezza originale dell'immagine.
 * @param {number} originalHeight - L'altezza originale dell'immagine.
 * 
 * @returns {string} La classe CSS che rappresenta l'orientamento dell'immagine: 
 *   'orientamento-orizzontale' o 'orientamento-verticale'.
 */
function getImageOrientationClass(originalWidth, originalHeight) {
    return originalWidth > originalHeight ? 'orientamento-orizzontale' : 'orientamento-verticale';
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto per preparare le stringhe dei dati json
// ***********************************************************************

/**
 * Prepara i dati di un'opera per essere serializzati in formato JSON.
 * In particolare, questa funzione sostituisce tutti i singoli apici (') con 
 * il codice HTML &apos; per evitare problemi di parsing o incompatibilità
 * con i formati JSON.
 * 
 * @param {Object} opera - L'oggetto contenente i dati dell'opera da preparare.
 * 
 * @returns {string} La stringa JSON dell'opera, con gli apici sostituiti con &apos;.
 */
function prepareOperaData(opera) {
    // Sostituisce, se presenti, i singoli apici con &apos (davano problemi)
    return JSON.stringify(opera).replace(/'/g, "&apos;");
}

// ***********************************************************************
// FUNZIONE: Crea una carta HTML per ciascuna opera
// ***********************************************************************

/**
 * Crea una carta HTML che rappresenta un'opera, includendo l'immagine, 
 * il titolo e altre informazioni, in un formato che può essere facilmente
 * aggiunto alla pagina web.
 * 
 * La funzione:
 * 1. Importa e carica l'immagine dell'opera.
 * 2. Adatta le dimensioni dell'immagine per l'inserimento nella carta.
 * 3. Determina l'orientamento dell'immagine (orizzontale o verticale).
 * 4. Prepara i dati JSON dell'opera.
 * 5. Genera e restituisce una stringa HTML che rappresenta la carta dell'opera.
 * 
 * @param {Object} opera - Oggetto che rappresenta un'opera con le informazioni
 *   necessarie (ad esempio, titolo, immagine, etc.).
 * 
 * @returns {Promise<string>} Una stringa HTML che rappresenta la carta dell'opera
 *   con le informazioni necessarie.
 */
export async function createOperaCard(opera) {
    // Importa l'immagine utilizzando il percorso definito nella funzione `getImagePath`.
    const image = new Image();
    image.src = getImagePath(opera.immagine);

    // Attendere che l'immagine sia caricata completamente (successo o errore)
    await new Promise(resolve => {
        image.onload = resolve;
        image.onerror = resolve;
    });

    // Aggiusta le dimensioni dell'immagine (adattandola alla griglia) usando `getAdjustedDimensions`.
    const {
        width,
        height,
        offsetX,
        offsetY
    } = getAdjustedDimensions(image.naturalWidth || 300, image.naturalHeight || 400);

    // Determina l'orientamento dell'immagine (orizzontale o verticale) con la funzione `getImageOrientationClass`.
    const orientamentoClasse = getImageOrientationClass(image.naturalWidth || 300, image.naturalHeight || 400);

    // Prepara i dati dell'opera per la serializzazione JSON, sostituendo eventuali apici con &apos;
    const operaData = prepareOperaData(opera);

    // Crea la struttura HTML per la carta dell'opera, includendo l'immagine, il titolo e altre informazioni.
    const operaCard = `
        <div class="opera ${orientamentoClasse}" style="--background-url: url('../${opera.immagine}')">
            <img src="${image.src}" alt="${opera.titolo}" 
                 data-opera='${operaData}' 
                 width="${width}" height="${height}"
                 loading="lazy"
                 style="width: ${width}px; height: ${height}px; margin: ${offsetY}px ${offsetX}px;">  
        </div>
    `;

    return operaCard; // Restituisce la carta dell'opera come stringa HTML
}

// ***********************************************************************
// FUNZIONE: Uniforma l'altezza delle immagini orizzontali
// ***********************************************************************

/**
 * Uniforma l'altezza delle immagini nelle righe della griglia delle opere, 
 * centrando verticalmente le immagini orizzontali che hanno un'altezza inferiore
 * rispetto alla più alta nell stessa riga.
 * 
 * La funzione:
 * 1. Seleziona tutte le opere all'interno della griglia.
 * 2. Raggruppa le opere in righe di 3 (presumibilmente per un layout a griglia).
 * 3. Calcola l'altezza massima delle immagini in ogni riga.
 * 4. Centra verticalmente le immagini che hanno un'altezza inferiore a quella massima.
 * 
 * @param {HTMLElement} gridOpere - L'elemento che contiene la griglia delle opere (ad esempio, una div con tutte le carte delle opere).
 */
export function adjustHorizontalImages(gridOpere) {
    // Seleziona tutte le opere all'interno della griglia delle opere
    const opere = Array.from(gridOpere.querySelectorAll(".opera"));
    const rows = [];

    // Raggruppa le opere in righe di 3 (una griglia con 3 colonne)
    for (let i = 0; i < opere.length; i += 3) {
        rows.push(opere.slice(i, i + 3));
    }

    // A questo punto, il JavaScript non deve più fare nulla per il centramento
    // Tutto il lavoro viene fatto tramite il CSS.
}

// ***********************************************************************
// FUNZIONE: Crea paragrafi con etichette e testo
// ***********************************************************************

/**
 * Crea un elemento di paragrafo (`<p>`) con un'etichetta in grassetto
 * seguita dal testo fornito.
 * 
 * La funzione:
 * 1. Crea un nuovo elemento `<p>` per rappresentare il paragrafo.
 * 2. Imposta il contenuto del paragrafo con l'etichetta (in grassetto) e il testo.
 * 3. Restituisce l'elemento `<p>` creato.
 * 
 * @param {string} label - L'etichetta da visualizzare prima del testo, es. "Nome", "Descrizione".
 * @param {string} [text=""] - Il testo da visualizzare dopo l'etichetta. Se non fornito, il testo sarà vuoto.
 * 
 * @returns {HTMLElement} L'elemento `<p>` con l'etichetta e il testo.
 */
export function createParagraph(label, text) {
    // Crea un nuovo elemento paragrafo
    const paragraph = document.createElement("p");

    // Imposta l'HTML interno del paragrafo con l'etichetta e il testo
    paragraph.innerHTML = `<strong>${label}:</strong> ${text || ""}`;

    // Restituisce il paragrafo creato
    return paragraph;
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto per trovare il path delle icone
// ***********************************************************************

/**
 * Determina il percorso assoluto per una icona a partire dal percorso relativo fornito.
 * La funzione gestisce in modo dinamico il percorso in base alla struttura della directory.
 * 
 * Se ci si trova all'interno della directory `/pages/`, la funzione rimuove `/pages` dal percorso corrente e 
 * aggiunge la cartella `/icons/` per costruire il percorso finale.
 * Se non ci si trova in `/pages/`, la funzione restituisce il percorso relativo alla cartella `icons/`.
 * 
 * @param {string} iconRelativePath - Il percorso relativo dell'icona (es. "home.svg").
 * 
 * @returns {string} Il percorso completo dell'icona, che può essere usato per il caricamento.
 */
export function getIconPath(iconRelativePath) {
    // Ottieni il percorso corrente della pagina
    let currentPath = window.location.pathname;

    // Verifica se il percorso contiene "/pages/"
    if (currentPath.includes("/pages/")) {
        // Se siamo nella directory "/pages/", rimuoviamo "/pages" dal percorso
        // e aggiungiamo "/icons/" prima del percorso relativo dell'icona
        currentPath = currentPath.replace("/pages", "").replace(/\/[^/]+$/, "") + "/icons/" + iconRelativePath;
    } else {
        // Se non siamo in "/pages/", costruisci semplicemente il percorso relativo alla directory "/icons/"
        currentPath = "icons/" + iconRelativePath;
    }

    // Restituisce il percorso completo dell'icona
    return currentPath;
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto per creare la barra di valutazione
// ***********************************************************************

/**
 * Crea una barra di valutazione visiva basata su un valore numerico.
 * La funzione genera un contenitore con una barra che indica la valutazione e 
 * aggiunge delle tacche per ogni punto di valutazione (da 1 a 9).
 * 
 * La barra di valutazione si espande in base al valore passato, che va da 0 a 10.
 * Ogni tacca rappresenta un punto di valutazione, e la barra sarà proporzionale 
 * alla valutazione (ad esempio, una valutazione di 7 farà occupare il 70% della larghezza).
 * 
 * @param {number} valutazione - Un valore numerico che rappresenta la valutazione (da 0 a 10).
 * 
 * @returns {HTMLElement} Il contenitore della barra di valutazione, comprensivo della barra e delle tacche.
 */
function createValutazioneBar(valutazione) {
    // Crea un contenitore per la barra di valutazione
    const container = document.createElement("div");
    container.classList.add("valutazione-container");

    // Crea la barra di valutazione
    const bar = document.createElement("div");
    bar.classList.add("valutazione-bar");
    // Imposta la larghezza della barra in base alla valutazione (0-10) e la converte in percentuale
    bar.style.width = `${(valutazione || 0) * 10}%`;

    // Aggiunge la barra al contenitore
    container.appendChild(bar);

    // Aggiungi le tacche alla barra, da 1 a 9
    for (let i = 1; i <= 9; i++) {
        // Crea una tacca per ogni punto della valutazione
        const tick = document.createElement("div");
        tick.classList.add("valutazione-tacca");
        // Posiziona ogni tacca ad una distanza del 10% dall'inizio
        tick.style.left = `${i * 10}%`;

        // Crea il numero associato alla tacca
        const numero = document.createElement("div");
        numero.classList.add("valutazione-numero");
        numero.textContent = i;

        // Aggiunge il numero alla tacca e la tacca al contenitore
        tick.appendChild(numero);
        container.appendChild(tick);
    }

    // Restituisce il contenitore con la barra di valutazione e le tacche
    return container;
}

// ***********************************************************************
// FUNZIONE: Funzione di supporto per mappare quale icona usare
// ***********************************************************************

/**
 * Crea un'icona per un tipo di opera (anime, film, libro, manga, serie TV, videogioco).
 * La funzione mappa ogni tipo di opera a un'icona specifica, crea un elemento `<img>` 
 * con il relativo percorso dell'icona e restituisce l'elemento pronto per essere aggiunto al DOM.
 * 
 * @param {string} tipo - Il tipo dell'opera per cui si vuole creare l'icona.
 * Possibili valori: "anime", "film", "libro", "manga", "serieTV", "videogioco".
 * 
 * @returns {HTMLElement} L'elemento `<img>` contenente l'icona per il tipo di opera specificato.
 */
function createIcon(tipo) {
    // Mappa i tipi di opere con i rispettivi file di icone
    const icone = {
        "anime": "icon_anime.png",
        "film": "icon_film.png",
        "libro": "icon_libri.png",
        "manga": "icon_manga.png",
        "serieTV": "icon_serieTV.png",
        "videogioco": "icon_videogiochi.png"
    };

    // Crea un elemento immagine per l'icona
    const icon = document.createElement("img");
    icon.alt = "Icona opera"; // Imposta il testo alternativo dell'immagine
    icon.classList.add("opera-icon"); // Aggiungi una classe per lo stile CSS

    // Trova il percorso dell'icona in base al tipo passato come parametro
    // Utilizza la funzione `getIconPath` per ottenere il percorso assoluto dell'icona
    icon.src = getIconPath(icone[tipo]);

    // Restituisce l'elemento immagine pronto per essere inserito nel DOM
    return icon;
}

// ***********************************************************************
// FUNZIONE: Funzione che mostra il modale e il suo contenuto
// ***********************************************************************

/**
 * Mostra il modale con i dettagli di un'opera.
 * La funzione prepara e visualizza il modale con informazioni come titolo, trama,
 * autore, anno, genere, valutazione e trailer (se disponibile). Viene anche 
 * mostrato un pulsante per chiudere il modale.
 * 
 * @param {Object} opera - Oggetto contenente i dati dell'opera da visualizzare nel modale.
 */
export function showModal(opera) {
    // Ripulisce il contenuto del modale ogni volta che si apre uno nuovo
    modalContent.innerHTML = "";

    // Crea l'header del modale (contenitore con titolo e icona)
    const headerModale = document.createElement("div");
    headerModale.classList.add("header-modale");

    // Crea il titolo del modale
    const title = document.createElement("h3");
    title.classList.add("title-modale");
    title.textContent = opera.titolo;

    // Crea l'icona associata all'opera
    const icon = createIcon(opera.tipo);

    // Aggiunge il titolo e l'icona nell'header del modale
    headerModale.append(title, icon);

    // Crea i paragrafi con le informazioni dell'opera (trama, autore, anno, genere, valutazione)
    const trama = createParagraph("Trama", opera.trama || "Trama non disponibile.");
    const autore = createParagraph("Autore", opera.autore || "Autore non disponibile");
    const anno = createParagraph("Anno", opera.data || "Data non disponibile");
    const genere = createParagraph("Genere", (opera.genere || []).join(" | ") || "Genere non disponibile");
    const valutazione = createParagraph("Valutazione" || "Valutazione non disponibile");

    // Crea la barra di valutazione per visualizzare il punteggio
    const valutazioneContainer = createValutazioneBar(opera.valutazione);
    valutazione.appendChild(valutazioneContainer);

    // Controlla se è presente un trailer per l'opera
    let trailerIframe = null;
    if (opera.trailer && (opera.tipo === "anime" || opera.tipo === "serieTV" || opera.tipo === "videogioco")) {
        trailerIframe = document.createElement("iframe");
        trailerIframe.width = "auto";
        trailerIframe.height = "auto";
        trailerIframe.src = opera.trailer;
        trailerIframe.title = `${opera.titolo} | TRAILER`;
        trailerIframe.allowFullscreen = true;
    }

    // Crea un pulsante per chiudere il modale
    const closeButton = document.createElement("button");
    closeButton.id = "chiudi-modale";
    closeButton.textContent = "X";
    closeButton.addEventListener("click", hideModal);

    // Aggiunge tutti gli elementi al contenuto del modale
    modalContent.append(
        headerModale,
        trama,
        autore,
        anno,
        genere,
        valutazione
    );

    // Aggiunge il trailer se disponibile
    if (trailerIframe) modalContent.appendChild(trailerIframe);

    // Aggiunge il pulsante di chiusura
    modalContent.appendChild(closeButton);

    // Mostra il modale applicando la classe CSS "show"
    modal.classList.add("show");
}

// ***********************************************************************
// FUNZIONE: Nascondi il modale e ferma il video
// ***********************************************************************

/**
 * Nasconde il modale e, se presente, ferma la riproduzione del video nel trailer.
 * La funzione rimuove la classe "show" dal modale per nasconderlo e, se c'è un iframe
 * (indicante un video di trailer), il video viene fermato modificando la sorgente dell'iframe.
 */
function hideModal() {
    // Rimuove la classe "show" per nascondere il modale
    modal.classList.remove("show");

    // Se il modale contiene un iframe (trailer), si ferma la riproduzione
    const iframe = modalContent.querySelector("iframe");
    if (iframe) {
        const iframeSrc = iframe.src;
        // Se il video è di YouTube, si interrompe la riproduzione settando "autoplay=0"
        if (iframeSrc.includes("youtube.com") || iframeSrc.includes("youtu.be")) {
            iframe.src = "";
            iframe.src = iframeSrc; // Ricarica l'iframe senza autoplay
        }
    }
}

// ***********************************************************************
// FUNZIONE: Inizializza menu hamburger
// ***********************************************************************

/**
 * Inizializza il comportamento del menu hamburger.
 * Imposta gli eventi per il funzionamento del menu: apertura, chiusura, clic esterni e scroll.
 */
export function initHamburgerMenu() {

    // Mostra o nasconde il menu al clic sul pulsante hamburger
    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita che il clic sull'hamburger venga propagato ad altri elementi
        toggleMenu(navList, overlay); // Chiama la funzione per mostrare o nascondere il menu
    });

    // Chiude il menu al clic sull'overlay (sfondo che appare quando il menu è aperto)
    overlay.addEventListener('click', () => {
        closeMenu(navList, overlay); // Chiama la funzione per chiudere il menu
    });

    // Chiude il menu al clic fuori dal menu e dal pulsante hamburger
    document.addEventListener('click', (event) => {
        // Verifica che il clic sia fuori dal menu e dal pulsante hamburger
        if (!navList.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMenu(navList, overlay); // Chiama la funzione per chiudere il menu
        }
    });

    // Chiude il menu al scroll della pagina
    window.addEventListener('scroll', () => {
        closeMenu(navList, overlay); // Chiama la funzione per chiudere il menu quando si scrolla la pagina
    });
}

// ***********************************************************************
// FUNZIONE: Fa apparire o meno il menu hamburger
// ***********************************************************************

/**
 * Mostra o nasconde il menu di navigazione.
 * Modifica la visibilità del menu e dell'overlay.
 * @param {HTMLElement} navList - L'elemento della lista di navigazione (menu).
 * @param {HTMLElement} overlay - L'elemento dell'overlay.
 */
function toggleMenu(navList, overlay) {
    /* Aggiunge o rimuove la classe 'open' per mostrare o nascondere il menu */
    const isOpen = navList.classList.toggle('open');
    /* Se il menu è aperto, mostra l'overlay, altrimenti lo nasconde */
    overlay.style.display = isOpen ? 'block' : 'none';
}

// ***********************************************************************
// FUNZIONE: Chiude la lista di navigazione del menu hamburger
// ***********************************************************************

/**
 * Chiude il menu di navigazione.
 * Rimuove la classe 'open' dal menu e nasconde l'overlay.
 * @param {HTMLElement} navList - L'elemento della lista di navigazione (menu).
 * @param {HTMLElement} overlay - L'elemento dell'overlay.
 */
function closeMenu(navList, overlay) {
    /* Rimuove la classe 'open' per nascondere il menu */
    navList.classList.remove('open');
    /* Nasconde l'overlay */
    overlay.style.display = 'none';
}