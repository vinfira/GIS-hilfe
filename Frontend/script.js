document.addEventListener('DOMContentLoaded', function() {
    const itemList = document.getElementById('itemList');

    // Funktion zum Laden der Lebensmittel-Liste
    function loadItemList() {
        fetch('http://localhost:3000/api/items')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Lebensmittel-Liste');
                }
                return response.json();
            })
            .then(data => {
                renderItemList(data);
            })
            .catch(error => console.error('Fehler beim Laden der Lebensmittel-Liste:', error));
    }

    // Funktion zum Rendern der Lebensmittel-Liste
    function renderItemList(itemListData) {
        itemList.innerHTML = '';
        itemListData.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} - Ablaufdatum: ${item.expiry}
                <span class="delete-btn" data-id="${item.id}">x</span>
            `;
            itemList.appendChild(li);
        });

        // Event-Listener für die Löschen-Schaltflächen
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteItem(id);
            });
        });
    }

    // Funktion zum Löschen eines Lebensmittels
    function deleteItem(id) {
        fetch(`http://localhost:3000/api/items/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Löschen des Lebensmittels');
            }
            loadItemList();
        })
        .catch(error => console.error('Fehler beim Löschen des Lebensmittels:', error));
    }

    // Laden der Lebensmittel-Liste beim Initialisieren
    loadItemList();

    // Event-Listener für das Hinzufügen eines neuen Lebensmittels
    const form = document.getElementById('addItemForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('itemName').value;
            const expiry = document.getElementById('expiryDate').value;

            const newItem = { name, expiry };

            fetch('http://localhost:3000/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler beim Hinzufügen des Lebensmittels');
                }
                return response.json();
            })
            .then(data => {
                loadItemList();
                form.reset();
            })
            .catch(error => console.error('Fehler beim Hinzufügen des Lebensmittels:', error));
        });
    }
});
