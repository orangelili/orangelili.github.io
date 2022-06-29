'use strict'

const TODAY = new Date();
const TODAY_VIEW_DATE = (TODAY.getMonth() + 1) + '月' + TODAY.getDate() + '日';

function addInputLi(value, id, option = null) {
    let li = document.createElement("li");
    li.classList.add("list-group-item");
    if (option) {
        li.classList.add(option)
    }
    li.textContent = '"' + value + '",';
    document.getElementById(id).append(li);
}

//table
const table = $('#example').DataTable({
    data: [],
    paging: false,
    stateSave: true,
    columns: [
        {
            title: '车次',
        },
        {
            title: '客户号',
        },
        {
            title: '目的地',
        },
        {
            title: '日期',
        },
        {
            title: '客户',
        },
        {
            title: 'FBA号',
        },
        {
            title: '客户BOL编号',
        },
        {
            title: '板数',
        },
        {
            title: '司机',
        },
        {
            title: '柜号',
        }
    ],
});

$('#example tbody').on('click', 'tr', function () {
    $(this).toggleClass('selected');
});

$('#removeRows').on('click', event => {
    table.rows('.selected').remove().draw(false)
});

$('#download').on('click', event => {
    let allData = Array.from(table.data());
    if (allData.length !== 0) {
        let content = '';
        Array.from(allData).forEach(info =>
            content += (info.join("\t") + "\n")
        );
        let blob = new Blob([content],
            { type: "text/plain;charset=utf-8" });
        saveAs(blob, "FBA_IN.txt");
    }
});

$('#genLabel').on('click', event => {
    let allData = Array.from(table.data());
    if (allData.length !== 0) {
        let labelCount = document.getElementById('labelCount').value ? parseInt(document.getElementById('labelCount').value) : 3;
        let content = '<html> <head> <style>h1{margin: 0;} body{padding: 10px 0; text-align: center;} div {font-size: 6vw;  } </style></head><body><div>';
        Array.from(allData).forEach(info => {
            content += '<div>';
            let quantity = parseInt(info['7'])
            let count = 1
            while (count <= quantity) {
                for (let i = 0; i < labelCount; i++) {
                    content += '<h1>' + info[1] + ' </h1>';
                    content += '<h1>' + info[2] + '(' + count + '/' + quantity + ')</h1>'
                    let parseDate = info[3].split("月");
                    let month = parseDate[0];
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    let day = (parseDate[1].split("日"))[0]
                    content += '<h1>' + month + '-' + day + '-2022</h1>';
                }
                count += 1
            }
            content += '</div>';
        });
        content += '</div></body></html>';
        let blob = new Blob([content],
            { type: "text/html;charset=utf-8" });
        saveAs(blob, "FBA_LABEL.html");
    }
});

//form
const forms = document.querySelectorAll('.needs-validation');

// Loop over them and prevent submission
Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    }, false);
});

//add datalist
const inputDatalists = {
    "truckCountInputs": "truckNumberDatalistOptions",
    "clientNumberInputs": "clientNumberDatalistOptions",
    "destinationInputs": "destinationDatalistOptions",
    "clientInputs": "clientDatalistOptions",
    "bolNumberInputs": "BOLNumberDatalistOptions",
    "driverInputs": "driverDatalistOptions",
    "containerNumberInputs": "containerDatalistOptions",
};

const datalistsMap = {
    "truckNumber": "truckCountInputs",
    "clientNumber": "clientNumberInputs",
    "destination": "destinationInputs",
    "client": "clientInputs",
    "BOLNumber": "bolNumberInputs",
    "driver": "driverInputs",
    "container": "containerNumberInputs",
};

for (let [key, value] of Object.entries(inputDatalists)) {
    Array.from(eval(key)).forEach(input => {
        let option = document.createElement("option");
        option.setAttribute('value', input);
        option.textContent = input;
        document.getElementById(value).append(option);
    });
}

for (let [key, value] of Object.entries(datalistsMap)) {
    Array.from(eval(value)).forEach(input => {
        addInputLi(input, value);
    });
}

//form submit event
document.getElementById('inForm').addEventListener('submit', event => {
    //console.log(`Form Submitted! Time stamp: ${event.timeStamp}`);
    event.preventDefault();

    if (event.target.checkValidity()) {
        const inputs = event.target.querySelectorAll('input.data');
        let data = [];
        Array.from(inputs).forEach(input => {
            let name = input.getAttribute('name');
            if (name == 'date') {
                if (input.value) {
                    let date_array = (input.value).split('-')
                    let month = date_array[1];
                    let day = date_array[2]
                    data.push(month + '月' + day + '日');
                } else {
                    data.push(TODAY_VIEW_DATE);
                }
            }

            if (name != 'flexdatalist-FBANumber' && name != 'date') {
                data.push(input.value);
            }

            //check exsit
            if (input.value && Object.keys(datalistsMap).includes(name)) {
                let array = eval(datalistsMap[name]);
                if (name === 'FBANumber') {
                    let manyValue = (input.value).split(',');
                    manyValue.forEach(everyValue => {
                        if (!array.includes(everyValue)) {
                            array.push(everyValue);
                            addInputLi(everyValue, datalistsMap[name], "text-bg-secondary");
                        }
                    })
                } else {
                    if (!array.includes(input.value)) {
                        array.push(input.value);
                        addInputLi(input.value, datalistsMap[name], "text-bg-secondary");
                    }
                }
            }

        });

        // localStorage.setItem('name','Chris');
        console.log(data);
        table.row.add(data).draw(false);
    }
});

//multiple selection
// $('#validationFBANumber').flexdatalist({
//     searchContain: true,
//     minLength: 0,
//     focusFirstResult: false,
//     toggleSelected: true,
// });

//var blob = new Blob(["Welcome to Websparrow.org."],
//        { type: "text/plain;charset=utf-8" });
//saveAs(blob, "static.txt");
