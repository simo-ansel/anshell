document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("random-opere");
    const modal = document.getElementById("modale");
    const modalContent = modal.querySelector(".modal-content");

    // Funzione per recuperare il file JSON
     // Funzione per recuperare il file JSON
     async function fetchOpere() {
        try {
            const response = await fetch("../data/anime.json");  // Percorso del file JSON
            if (!response.ok) throw new Error("Errore nel caricamento delle opere.");
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }

// Funzione per calcolare le dimensioni dell'immagine
function getAdjustedDimensions(width, height, maxWidth = 450, maxHeight = 600) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio); // Usa il rapporto più piccolo per mantenere le proporzioni
    return {
        width: Math.round(width * ratio),
        height: Math.round(height * ratio)
    };
}


// Funzione per generare il contenuto HTML della locandina con dimensioni calcolate
async function createOperaCard(opera) {
    const image = new Image();
    image.src = opera.immagine;

    // Assicuriamoci che l'immagine sia caricata prima di calcolare le dimensioni
    await new Promise(resolve => {
        image.onload = resolve;
        image.onerror = resolve; // Gestisce eventuali errori di caricamento
    });

    // Ottieni le dimensioni originali dell'immagine
    const originalWidth = image.naturalWidth || 300;
    const originalHeight = image.naturalHeight || 400;

    // Aggiungi la classe per orientamento orizzontale o verticale
    let orientamentoClasse = originalWidth > originalHeight ? 'orientamento-orizzontale' : 'orientamento-verticale';
    
    // Calcola le dimensioni proporzionate
    const { width, height } = getAdjustedDimensions(originalWidth, originalHeight);

    // Codifica i dati JSON per il passaggio come attributo HTML
    const operaData = JSON.stringify(opera).replace(/'/g, "&apos;");

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

function adjustHorizontalImages() {
    const opere = Array.from(container.querySelectorAll(".opera"));
    const rows = [];

    for (let i = 0; i < opere.length; i += 3) {
        rows.push(opere.slice(i, i + 3));
    }

    rows.forEach((row) => {
        const heights = row.map((opera) => {
            const img = opera.querySelector("img");
            return img ? img.offsetHeight : 0;
        });

        const maxHeight = Math.max(...heights);

        row.forEach((opera, index) => {
            const img = opera.querySelector("img");
            if (img && img.offsetHeight < maxHeight) {
                const marginTop = (maxHeight - img.offsetHeight) / 2;
                img.style.marginTop = `${marginTop}px`;
            }
        });
    });
}


    // Mostra il modale con le informazioni dell'opera
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

        // Aggiungi listener al pulsante per chiudere il modale
        const closeModalButton = document.getElementById("chiudi-modale");
        closeModalButton.addEventListener("click", hideModal);

        modal.classList.add("show"); // Aggiungi la classe per mostrare il modale con animazione
    }

    // Nascondi il modale con animazione di dissolvenza
    function hideModal() {
        modal.classList.remove("show"); // Rimuovi la classe che mostra il modale
    }

    // Carica le opere e mostra solo 6 casuali
    const opere = await fetchOpere();
    console.log("Opere caricate:", opere); // Log per verificare i dati caricati

    if (opere.length > 0) {
        const operaCards = await Promise.all(opere.map(createOperaCard)); // Usa Promise.all
        container.innerHTML = operaCards.join(""); // Inserisci le locandine nel DOM
    

        setTimeout(adjustHorizontalImages, 100);

        // Aggiungi evento click alle immagini per aprire il modale
        const images = container.querySelectorAll("img");
        images.forEach((img) => {
            img.addEventListener("click", (event) => {
                const operaData = event.target.getAttribute("data-opera");
                if (!operaData) {
                    console.error("Dati dell'opera non trovati.");
                    return;
                }
                try {
                    // Decodifica l'attributo data-opera e analizza i dati JSON
                    const opera = JSON.parse(operaData.replace(/&apos;/g, "'"));
                    console.log("Opera selezionata:", opera); // Verifica i dati
                    showModal(opera);
                } catch (error) {
                    console.error("Errore nel parsing dei dati dell'opera:", error);
                }
            });

            // Hover per effetto ombra e zoom
            img.addEventListener("mouseover", () => {
                img.style.boxShadow = "0 0 15px 5px rgba(122, 97, 217, 1)";
                img.style.transform = "scale(1.05)"; // Zoom leggero all'hover
                img.style.transition = "transform 0.3s ease-in-out";
            });

            img.addEventListener("mouseout", () => {
                img.style.boxShadow = "";
                img.style.transform = "scale(1)"; // Rimuovi l'effetto zoom
            });
        });

        // Observer per animazione delle locandine
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show'); // Animazione di ingresso per ogni locandina
                }
            });
        }, { threshold: 0.5 });

        const opereCards = container.querySelectorAll(".opera");
        opereCards.forEach(operaCard => {
            observer.observe(operaCard); // Osserva tutte le locandine
        });

    } else {
        container.innerHTML = `<p class="text-gray-400 text-center">Nessuna opera disponibile.</p>`;
    }

    document.getElementById("reload-button").addEventListener("click", function() {
          // Scrolla alla parte superiore della pagina prima di ricaricare
        window.scrollTo(0, 0);
        location.reload(); // Ricarica la pagina
    });
});
