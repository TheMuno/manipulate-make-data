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

document.addEventListener('DOMContentLoaded', fetchGoogleSheetData); 