// ***********************************************************************
// INIZIALIZZAZIONE DEL DOCUMENTO
// ***********************************************************************

document.addEventListener("DOMContentLoaded", async () => {
    // Recupera gli elementi del DOM necessari
    const container = document.getElementById("random-opere");
    const modal = document.getElementById("modale");
    const modalContent = modal.querySelector(".modal-content");

    // ***********************************************************************
    // FUNZIONE: Recupera il file JSON contenente i dati delle opere
    // ***********************************************************************
    async function fetchOpere() {
        try {
            const response = await fetch("../data/film.json"); // Percorso del file JSON
            if (!response.ok) throw new Error("Errore nel caricamento delle opere.");
            return await response.json();
        } catch (error) {
            console.error(error);
            return []; // Ritorna un array vuoto in caso di errore
        }
    }

    // ***********************************************************************
    // FUNZIONE: Calcola le dimensioni proporzionate di un'immagine
    // ***********************************************************************
    function getAdjustedDimensions(width, height, maxWidth = 450, maxHeight = 600) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio); // Mantieni le proporzioni
        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio)
        };
    }

    // ***********************************************************************
    // FUNZIONE: Genera il contenuto HTML di una singola opera
    // ***********************************************************************
    async function createOperaCard(opera) {
        const image = new Image();
        image.src = opera.immagine;

        // Aspetta che l'immagine sia caricata o che si verifichi un errore
        await new Promise(resolve => {
            image.onload = resolve;
            image.onerror = resolve; // In caso di errore
        });

        // Dimensioni originali dell'immagine
        const originalWidth = image.naturalWidth || 300; // Default: 300px
        const originalHeight = image.naturalHeight || 400; // Default: 400px

        // Determina l'orientamento per aggiungere una classe specifica
        let orientamentoClasse = originalWidth > originalHeight
            ? 'orientamento-orizzontale'
            : 'orientamento-verticale';

        // Calcola le dimensioni proporzionate
        const { width, height } = getAdjustedDimensions(originalWidth, originalHeight);

        // Serializza i dati dell'opera per passarli come attributo HTML
        const operaData = JSON.stringify(opera).replace(/'/g, "&apos;");

        // Ritorna il markup HTML
        return `
            <div class="opera ${orientamentoClasse}">
                <img src="${opera.immagine}" alt="${opera.titolo}" 
                     data-opera='${operaData}' 
                     style="width: ${width}px; height: ${height}px;">
                <div class="divider"></div>
                <h3>${opera.titolo}</h3>
            </div>
        `;
    }

    // ***********************************************************************
    // FUNZIONE: Allinea immagini orizzontali per migliorare la visualizzazione
    // ***********************************************************************
    function adjustHorizontalImages() {
        const opere = Array.from(container.querySelectorAll(".opera"));
        const rows = [];

        // Raggruppa le opere in righe da 3
        for (let i = 0; i < opere.length; i += 3) {
            rows.push(opere.slice(i, i + 3));
        }

        // Calcola e applica margini per uniformare l'altezza
        rows.forEach(row => {
            const heights = row.map(opera => {
                const img = opera.querySelector("img");
                return img ? img.offsetHeight : 0;
            });

            const maxHeight = Math.max(...heights);

            row.forEach(opera => {
                const img = opera.querySelector("img");
                if (img && img.offsetHeight < maxHeight) {
                    const marginTop = (maxHeight - img.offsetHeight) / 2;
                    img.style.marginTop = `${marginTop}px`;
                }
            });
        });
    }

    // ***********************************************************************
    // FUNZIONE: Mostra il modale con le informazioni dettagliate dell'opera
    // ***********************************************************************
    function showModal(opera) {
        const anno = opera.data ? opera.data.replace('data;', '').trim() : "Anno non disponibile";

        modalContent.innerHTML = `
        <div class="modal-header">
            <h3>${opera.titolo}</h3>
        </div>
        <div class="modal-body">
            <p><strong>Trama:</strong> ${opera.trama || "Nessuna trama disponibile."}</p>
            <p><strong>Autore:</strong> ${opera.autore || "Non disponibile"}</p>
            <p><strong>Anno:</strong> ${anno}</p>
            <p><strong>Genere:</strong> ${opera.genere[0] + " | " + opera.genere[1] + " | " + opera.genere[2] || "Non disponibile"}</p>
            <p><strong>Valutazione:</strong> ${opera.valutazione || "Non disponibile"}</p>
            <iframe width="560" height="315" src="${opera.trailer}" title="${opera.titolo} | TRAILER" allowfullscreen></iframe>
            <button id="chiudi-modale">X</button>
        </div>
    `;

        // Aggiungi evento per chiudere il modale
        const closeModalButton = document.getElementById("chiudi-modale");
        closeModalButton.addEventListener("click", hideModal);

        modal.classList.add("show"); // Mostra il modale
    }

    // ***********************************************************************
    // FUNZIONE: Nasconde il modale
    // ***********************************************************************
    function hideModal() {
        modal.classList.remove("show"); // Nascondi il modale
    }

    // ***********************************************************************
    // CARICAMENTO DELLE OPERE E SETUP EVENTI
    // ***********************************************************************
    const opere = await fetchOpere(); // Recupera i dati dal file JSON
    console.log("Opere caricate:", opere);

    if (opere.length > 0) {
        const operaCards = await Promise.all(opere.map(createOperaCard)); // Crea le card
        container.innerHTML = operaCards.join(""); // Aggiungi le card al container

        // Allinea le immagini dopo il rendering
        setTimeout(adjustHorizontalImages, 100);

        // Aggiungi eventi click alle immagini
        const images = container.querySelectorAll("img");
        images.forEach(img => {
            img.addEventListener("click", (event) => {
                const operaData = event.target.getAttribute("data-opera");
                if (operaData) {
                    try {
                        const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                        showModal(opera); // Mostra i dettagli dell'opera
                    } catch (error) {
                        console.error("Errore nel parsing dei dati:", error);
                    }
                }
            });

            // Effetto hover per immagini
            img.addEventListener("mouseover", () => {
                img.style.boxShadow = "0 0 15px 5px rgba(122, 97, 217, 1)";
                img.style.transform = "scale(1.05)";
                img.style.transition = "transform 0.3s ease-in-out";
            });

            img.addEventListener("mouseout", () => {
                img.style.boxShadow = "";
                img.style.transform = "scale(1)";
            });
        });
    } else {
        container.innerHTML = `<p class="text-gray-400 text-center">Nessuna opera disponibile.</p>`;
    }

    // ***********************************************************************
    // EVENTO: Ricarica la pagina con il pulsante
    // ***********************************************************************
    document.getElementById("reload-button").addEventListener("click", () => {
        window.scrollTo(0, 0); // Torna in cima alla pagina
        location.reload(); // Ricarica la pagina
    });
});
