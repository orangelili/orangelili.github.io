//storageAvailable('localStorage')
//storageAvailable('sessionStorage')
//if (storageAvailable('localStorage')) {
//   Yippee! We can use localStorage awesomeness
//}
//else {
//   Too bad, no localStorage for us
//}
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function getByIdInWebStorage(id, type) {
    return JSON.parse(window[type].getItem(id))
}

function setByIdInWebStorage(id, type, value) {
    window[type].setItem(id, JSON.stringify(value));
}

function removeByIdInWebStorage(id, type) {
    window[type].removeItem(id);
}

function clearInWebStorage(type) {
    let allDataKey = Array.from(getAllDataKeyInWebStorage(type));
    allDataKey.forEach(everyId => {
        removeByIdInWebStorage(everyId, type);
    });
    setByIdInWebStorage(ALL_DATA_KEY, type, []);
}

function getAllDataKeyInWebStorage(type) {
    if (!window[type].getItem(ALL_DATA_KEY)) {
        setByIdInWebStorage(ALL_DATA_KEY, type, []);
    }
    return getByIdInWebStorage(ALL_DATA_KEY, type);
}

function getAllDataInWebStorage(type) {
    let allDataKey = getAllDataKeyInWebStorage(type)

    let data = [];
    Array.from(allDataKey).forEach(everyKey => {
        data.push(getByIdInWebStorage(everyKey, type));
    });

    return data;
}

function setAllDataKeyInWebStorage(type, keys) {
    setByIdInWebStorage(ALL_DATA_KEY, type, keys);
}

function saveDataByIdInWebStorage(id, type, data) {
    let allDataKey = Array.from(getAllDataKeyInWebStorage(type));
    if (!allDataKey.includes(id)) {
        allDataKey.push(id);
        setAllDataKeyInWebStorage(type, allDataKey)
    }

    setByIdInWebStorage(id, type, data);
}

// datalist records
function getRecordsInWebStorage(id, type, defaultValue) {
    if (!window[type].getItem(id)) {
        setByIdInWebStorage(id, type, defaultValue);
    }
    return getByIdInWebStorage(id, type);
}

function addRecordsInWebStorage(id, type, value) {
    let all = getByIdInWebStorage(id, type)
    if (!all.includes(value)) {
        all.push(value);
        setByIdInWebStorage(id, type, all)
        return true;
    }

    return false;
}
