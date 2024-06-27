document.addEventListener('DOMContentLoaded', function() {
    loadItems();
});

document.getElementById('button').addEventListener('click', function(event) {

    var itemName = document.getElementById('itemName').value;
    var expiryDate = document.getElementById('expiryDate').value;

    if (itemName && expiryDate) {
        addItem(itemName, expiryDate, false);
        document.getElementById('itemName').value = '';
        document.getElementById('expiryDate').value = '';
    } else {
        alert('Bitte geben Sie sowohl den Namen als auch das Ablaufdatum des Lebensmittels ein.');
    }
});

function addItem(name, expiry, schonvorhanden) {
    var itemList = document.getElementById('itemList');
    var listItem = document.createElement('li');
    listItem.textContent = name + ' - Ablaufdatum: ' + expiry;
    
    var removeButton = document.createElement('span');
    removeButton.textContent = 'X';
    removeButton.className = 'remove';
    removeButton.onclick = function() {
        itemList.removeChild(listItem);
        removeItemFromStorage(name, expiry);
    };

    listItem.appendChild(removeButton);
    itemList.appendChild(listItem);
    if (schonvorhanden == false) { //man könnte auch if (!schonvorhanden) schreiben
        saveItemToStorage(name, expiry);
    }
}

function saveItemToStorage(name, expiry) {
    var items = JSON.parse(localStorage.getItem('items')) || [];
    items.push({ name: name, expiry: expiry });
    localStorage.setItem('items', JSON.stringify(items));
}

function loadItems() {
    var items = JSON.parse(localStorage.getItem('items')) || [];
    items.forEach(function(item) {
        addItem(item.name, item.expiry, true);
    });
}

function removeItemFromStorage(name, expiry) {
    var items = JSON.parse(localStorage.getItem('items')) || [];
    items = items.filter(function(item) {
        return item.name !== name || item.expiry !== expiry;
    });
    localStorage.setItem('items', JSON.stringify(items));
}