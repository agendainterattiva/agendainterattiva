const settimanaDiv = document.getElementById('settimana');
const rangeSettimana = document.getElementById('range-settimana');
let dataCorrente = new Date(); // Inizia dalla settimana corrente

// Funzione per ottenere l'inizio della settimana corrente
function getInizioSettimana(date) {
    const giorno = date.getDay();
    const diff = date.getDate() - giorno + (giorno === 0 ? -6 : 1); // Se domenica, torna a lunedì precedente
    return new Date(date.setDate(diff));
}

// Funzione per formattare la data in formato "Domenica 1 Settembre"
function formattaData(date) {
    return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Funzione per formattare l'orario in formato 24 ore "HH:mm"
function formattaOra(ora) {
    const [ore, minuti] = ora.split(':').map(Number);
    return `${ore.toString().padStart(2, '0')}:${minuti.toString().padStart(2, '0')}`;
}

// Funzione per ordinare gli appuntamenti per orario
function ordinaAppuntamenti(appuntamenti) {
    return appuntamenti.sort((a, b) => {
        if (a.data === b.data) {
            return a.ora.localeCompare(b.ora); // Ordina per orario se la data è uguale
        }
        return new Date(a.data) - new Date(b.data); // Ordina per data
    });
}

// Funzione per aggiornare la visualizzazione della settimana
function aggiornaSettimana() {
    settimanaDiv.innerHTML = ''; // Pulisce il contenuto attuale

    let inizioSettimana = getInizioSettimana(new Date(dataCorrente));
    let fineSettimana = new Date(inizioSettimana);
    fineSettimana.setDate(fineSettimana.getDate() + 6);

    rangeSettimana.textContent = `${formattaData(inizioSettimana)} - ${formattaData(fineSettimana)}`;

    for (let i = 0; i < 7; i++) {
        const giorno = new Date(inizioSettimana);
        giorno.setDate(inizioSettimana.getDate() + i);

        const giornoDiv = document.createElement('div');
        giornoDiv.className = 'giorno';

        // Creiamo un contenitore per la data
        const headerGiorno = document.createElement('div');
        headerGiorno.className = 'header-giorno';
        headerGiorno.innerHTML = `<h3>${formattaData(giorno)}</h3>`;

        giornoDiv.appendChild(headerGiorno);

        settimanaDiv.appendChild(giornoDiv);

        // Aggiungi evento click per mostrare la schermata espansa
        headerGiorno.addEventListener('click', function() {
            mostraSchermataEspansa(giorno);
        });
    }
}

// Funzione per mostrare la schermata espansa
function mostraSchermataEspansa(giorno) {
    settimanaDiv.innerHTML = ''; // Pulisce il contenuto attuale

    const giornoDiv = document.createElement('div');
    giornoDiv.className = 'giorno espanso';

    const headerGiorno = document.createElement('div');
    headerGiorno.className = 'header-giorno';
    headerGiorno.innerHTML = `<h3>${formattaData(giorno)}</h3>`;

    const chiudiBtn = document.createElement('button');
    chiudiBtn.textContent = 'X';
    chiudiBtn.className = 'chiudi-espanso';

    chiudiBtn.addEventListener('click', function() {
        aggiornaSettimana(); // Torna alla vista settimanale
    });

    headerGiorno.appendChild(chiudiBtn);
    giornoDiv.appendChild(headerGiorno);

    const listaAppuntamenti = document.createElement('ul');
    listaAppuntamenti.className = 'lista-appuntamenti';

    const appuntamentiSalvati = JSON.parse(localStorage.getItem('appuntamenti')) || [];
    const appuntamentiPerGiorno = appuntamentiSalvati.filter(app => app.data === giorno.toISOString().split('T')[0]);

    const appuntamentiOrdinati = ordinaAppuntamenti(appuntamentiPerGiorno);

    if (appuntamentiOrdinati.length > 0) {
        appuntamentiOrdinati.forEach((appuntamento, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${formattaOra(appuntamento.ora)} - ${appuntamento.nome} ${appuntamento.cognome} (${appuntamento.telefono}) : ${appuntamento.motivo}
                <button class="elimina" data-index="${index}">X</button>`;
            listaAppuntamenti.appendChild(li);
        });
    } else {
        listaAppuntamenti.innerHTML = '<li>Nessun appuntamento per questo giorno</li>';
    }

    giornoDiv.appendChild(listaAppuntamenti);
    settimanaDiv.appendChild(giornoDiv);

    // Aggiungi gestione eventi per i pulsanti di eliminazione
    document.querySelectorAll('.elimina').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            eliminaAppuntamento(index);
        });
    });
}

// Funzione per eliminare un appuntamento
function eliminaAppuntamento(index) {
    let appuntamenti = JSON.parse(localStorage.getItem('appuntamenti')) || [];
    appuntamenti.splice(index, 1); // Rimuove l'appuntamento all'indice specificato
    localStorage.setItem('appuntamenti', JSON.stringify(appuntamenti));
    aggiornaSettimana(); // Ricarica la settimana per aggiornare la visualizzazione
}

// Gestione del form di inserimento pazienti
document.getElementById('appuntamento-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const cognome = document.getElementById('cognome').value;
    const telefono = document.getElementById('telefono').value;
    const data = document.getElementById('data').value;
    const ora = document.getElementById('ora').value;
    const motivo = document.getElementById('motivo').value;

    if (!nome || !cognome || !telefono || !data || !ora || !motivo) {
        alert('Per favore, completa tutti i campi del modulo.');
        return;
    }

    const appuntamento = { nome, cognome, telefono, data, ora: formattaOra(ora), motivo };

    let appuntamenti = JSON.parse(localStorage.getItem('appuntamenti')) || [];
    appuntamenti.push(appuntamento);
    localStorage.setItem('appuntamenti', JSON.stringify(appuntamenti));

    aggiornaSettimana();
    document.getElementById('appuntamento-form').reset();
});

// Navigazione tra le settimane
document.getElementById('prevWeek').onclick = function() {
    dataCorrente.setDate(dataCorrente.getDate() - 7);
    aggiornaSettimana();
};

document.getElementById('nextWeek').onclick = function() {
    dataCorrente.setDate(dataCorrente.getDate() + 7);
    aggiornaSettimana();
};

// Aggiorna la visualizzazione all'avvio
aggiornaSettimana();
