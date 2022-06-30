'use strict'

let fbaInfo = {
    "id": '',
    "truckNumber": '',
    "clientNumber": '',
    "destination": '',
    "date": '',
    "client": '',
    "fbaNumber": '',
    "bolNumber": '',
    "banQuantity": 0,
    "driver": '',
    "container": '',
};

const FBA_INFO_ID_PREFIX = 'fbaInfo';
const ALL_DATA_KEY = 'allFBAInfo';
const FBA_INFO_DATA = ["truckNumber", "clientNumber", "destination", "date", "client", "fbaNumber", "bolNumber", "banQuantity", "driver", "container"];
const FBA_DATA_TAG = ["车次","客户号", "目的地", "日期", "客户", "FBA号", "客户BOL编号","板数", "司机", "柜号"];
const FBA_STORAGE_TYPE = 'sessionStorage';
// const FBA_STORAGE_TYPE = 'page';
const FBA_DATALIST_STORAGE_TYPE = 'localStorage'

storageAvailable(FBA_STORAGE_TYPE);

const forms = document.querySelectorAll('.needs-validation');
Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    }, false);
});

const container = document.getElementById('example');
const cols = [];
FBA_INFO_DATA.forEach(name => {
    cols.push({ data: name });
})
const hot = new Handsontable(container, {
    data: getFBAS(),
    rowHeaders: true,
    colHeaders: FBA_DATA_TAG,
    columnSorting: true,
    contextMenu: ['copy', 'remove_row'],
    selectionMode: 'multiple',
    width: '100%',
    height: 'auto',
    stretchH: 'all',
    copyPaste: true,
    columns: cols,
    licenseKey: 'non-commercial-and-evaluation', // for non-commercial use only
});

function getFBAS() {
    return getAllDataInWebStorage(FBA_STORAGE_TYPE);
}

const AFTER_SUBMIT_BE_EMPTY = ['destination', 'banQuantity']

//form submit event
document.getElementById('inForm').addEventListener('submit', event => {
    event.preventDefault();

    if (event.target.checkValidity()) {
        const inputs = event.target.querySelectorAll('input.data');
        Array.from(inputs).forEach(input => {
            let name = input.getAttribute('name');
            fbaInfo[name] = input.value;

            if (DATA_HAS_DATALIST.includes(name) && input.value) {
                const key = name + DEFAULT_RECORDS_KEY_SUFFIX;
                if (addRecordsInWebStorage(key, FBA_DATALIST_STORAGE_TYPE, input.value)) {
                    let datalist = document.getElementById(name + DATALIST_ID_SUFFIX)
                    const optionTag = document.createElement('option');
                    optionTag.setAttribute('value', input.value);
                    optionTag.textContent = input.value;
                    datalist.appendChild(optionTag);
                }
            }

            if (AFTER_SUBMIT_BE_EMPTY.includes(name)) {
                document.getElementById(name + DATA_INPUT_ID_SUFFIX).value = '';
            }
        });
        console.log(fbaInfo);

        if (!fbaInfo.id) {
            fbaInfo.id = FBA_INFO_ID_PREFIX + Date.now();
        }

        saveDataByIdInWebStorage(fbaInfo.id, FBA_STORAGE_TYPE, fbaInfo)

        //refresh table
        hot.updateSettings({
            data: getFBAS(),
        });
    }
});

hot.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
    let needRemoveId = [];
    Array.from(physicalRows).forEach(row => {
        needRemoveId.push(hot.getSourceDataAtRow(row).id);
    })

    const allDataKey = getAllDataKeyInWebStorage(FBA_STORAGE_TYPE)
    needRemoveId.forEach(id => {
        const index = allDataKey.indexOf(id);
        if (index > -1) {
            allDataKey.splice(index, 1);
        }
        removeByIdInWebStorage(id, FBA_STORAGE_TYPE);
    });
    setAllDataKeyInWebStorage(FBA_STORAGE_TYPE, allDataKey);
})

hot.addHook('afterChange', (changes) => {
    if (changes) {
        changes.forEach(([row, prop, oldValue, newValue]) => {
            let aData = hot.getSourceDataAtRow(row);
            aData[prop] = newValue;
            setByIdInWebStorage(aData.id, FBA_STORAGE_TYPE, aData);
        });
    }
})

document.getElementById('clear').addEventListener('click', e => {
    hot.clear();
    clearInWebStorage(FBA_STORAGE_TYPE)
})

document.getElementById('copy').addEventListener('click', e => {
    hot.selectAll();
    hot.getPlugin('copyPaste').copy();
})

$('#download').on('click', event => {
    if (hot.getData().length > 0) {
        const exportPlugin = hot.getPlugin('exportFile');
        const filename = 'FBA_INFO_' + (new Date()).toLocaleString();
        exportPlugin.downloadFile('csv', {filename: filename});
    }
});

$('#genLabel').on('click', event => {
    const labelCount = document.getElementById('labelCount').value ? parseInt(document.getElementById('labelCount').value) : 3;

    if (isWebStoreage(FBA_STORAGE_TYPE)) {
        window.open(`./LabelsStyle.html?labelCount=${labelCount}&storageType=${FBA_STORAGE_TYPE}&allDataKey=${ALL_DATA_KEY}`, "_blank");
    } else {
        const data = hot.getSourceData();
        const all = genLabels(data, labelCount);
        let content = '<html> <head> <style>h1{margin: 0;} body{padding: 10px 0; text-align: center;} div {font-size: 6vw;  } </style></head><body><div>';
        Array.from(all).forEach(every => {
            content += '<div>';
            content += '<h1>' + every[0] + ' </h1>';
            content += '<h1>' + every[1] + ' </h1>';
            content += '<h1>' + every[2] + ' </h1>';
            content += '</div>';
        });
        content += '</div></body></html>';

        let blob = new Blob([content],
        { type: "text/html;charset=utf-8" });
        saveAs(blob, "FBA_LABEL.html");
    }
});
