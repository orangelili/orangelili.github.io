let label = {
    "id": '',
    "clientNumber": '',
    "destination": '',
    "date": '',
    "banQuantity": 0,
};

const LABEL_ID_PREFIX = 'label';
const ALL_DATA_KEY = 'allLabels';
const LABEL_DATA = ["clientNumber", "destination", "date", "banQuantity"];
const LABEL_DATA_TAG = ["客户号", "目的地", "日期", "板数"];
const LABEL_STORAGE_TYPE = 'sessionStorage';

storageAvailable(LABEL_STORAGE_TYPE);

//form
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
const hot = new Handsontable(container, {
    data: getLabels(),
    rowHeaders: true,
    colHeaders: LABEL_DATA_TAG,
    columnSorting: true,
    contextMenu: ['copy', 'cut', 'remove_row'],
    selectionMode: 'multiple',
    width: '100%',
    height: 'auto',
    stretchH: 'all',
    columns: [
        { data: LABEL_DATA[0] },
        { data: LABEL_DATA[1] },
        { data: LABEL_DATA[2] },
        { data: LABEL_DATA[3] }
    ],
    licenseKey: 'non-commercial-and-evaluation', // for non-commercial use only
});

const AFTER_SUBMIT_BE_EMPTY = ['destination', 'banQuantity']

//form submit event
document.getElementById('inForm').addEventListener('submit', event => {
    //console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);
    event.preventDefault();

    if (event.target.checkValidity()) {
        const inputs = event.target.querySelectorAll('input.data');
        Array.from(inputs).forEach(input => {
            let name = input.getAttribute('name');
            label[name] = input.value;

            if (DATA_HAS_DATALIST.includes(name) && input.value) {
                let index = DATA_HAS_DATALIST.indexOf(name);
                if (addRecordsInWebStorage(DEFAULT_RECORDS_KEYS[index], RECORDS_STORAGE_TYPE, input.value)) {
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
        console.log(label);

        if (!label.id) {
            label.id = LABEL_ID_PREFIX + Date.now();
        }

        saveDataByIdInWebStorage(label.id, LABEL_STORAGE_TYPE, label)

        //refresh table
        hot.updateSettings({
            data: getLabels(),
        });
    }
});

function getLabels() {
    return getAllDataInWebStorage(LABEL_STORAGE_TYPE);
}

hot.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
    let needRemoveId = [];
    Array.from(physicalRows).forEach(row => {
        needRemoveId.push(hot.getSourceDataAtRow(row).id);
    })

    const allDataKey = getAllDataKeyInWebStorage(LABEL_STORAGE_TYPE)
    needRemoveId.forEach(id => {
        const index = allDataKey.indexOf(id);
        if (index > -1) {
            allDataKey.splice(index, 1);
        }
        removeByIdInWebStorage(id, LABEL_STORAGE_TYPE);
    });
    setAllDataKeyInWebStorage(LABEL_STORAGE_TYPE, allDataKey);
})

hot.addHook('afterChange', (changes) => {
    if (changes) {
        changes.forEach(([row, prop, oldValue, newValue]) => {
            let alabel = hot.getSourceDataAtRow(row);
            alabel.prop = newValue;
            setByIdInWebStorage(alabel.id, LABEL_STORAGE_TYPE, alabel);
        });
    }
})

document.getElementById('genLabel').addEventListener('click', e => {
    let labelCount = document.getElementById('labelCount').value
    window.open(`./LabelsStyle.html?labelCount=${labelCount}&storageType=${LABEL_STORAGE_TYPE}&allDataKey=${ALL_DATA_KEY}`, "_blank");
})

document.getElementById('clear').addEventListener('click', e => {
    hot.clear();
    clearInWebStorage(LABEL_STORAGE_TYPE)
})
