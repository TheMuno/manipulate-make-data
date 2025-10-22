const spreadsheetId = '1Ef5djoE68lL_qn_Qk7PlRB676UdF-zLF43aerF4A5mE';
const apiKey = 'AIzaSyDQpFatuEeQMlVkMK8y4BjhVMH0dexgKeU';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1?key=${apiKey}`;

async function fetchGoogleSheetData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const rows = data.values;
        /*const tableBody = document.querySelector('#data-table tbody');

        for (let i = 1; i < rows.length; i++) {
            const row = document.createElement('tr');
            
            rows[i].forEach(cell => {
                const cellElement = document.createElement('td');
                cellElement.textContent = cell;
                row.appendChild(cellElement);
            });
            
            tableBody.appendChild(row);
        }*/

        console.log('Data', data)
        console.log('Rows', rows)

    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
    }
}

document.querySelector('.log-data').addEventListener('click', e => {
    console.log('Loading...')
    fetchGoogleSheetData(); 
});  

const $dateCreated = document.querySelector('.date-created');
const $arrivalDate = document.querySelector('.arrival-date');
const $datePickerField = document.querySelector('.date');

const fp = flatpickr($datePickerField, {
    mode: 'range',
    altInput: true,
    enableTime: false,
    altFormat: 'D M j',
    dateFormat: 'Y-m-d',
  	minDate: 'today',
    onClose: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 0) return;
        checkForCapacityOnDatePickerClose(selectedDates);         
    },
});

function checkForCapacityOnDatePickerClose(dateArr) {
    const today = new Date();
    $dateCreated.textContent = today.toDateString();
    $arrivalDate.textContent = processArrivalDate(dateArr);
}

function processArrivalDate(dateArr) {
    const date = dateArr[0];
    return new Date(date).toDateString();
}  
