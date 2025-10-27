const spreadsheetId = '1Ef5djoE68lL_qn_Qk7PlRB676UdF-zLF43aerF4A5mE';
const apiKey = 'AIzaSyDQpFatuEeQMlVkMK8y4BjhVMH0dexgKeU';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:F100?key=${apiKey}`;

async function getSheetData() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values || [];

    if (rows.length < 2) {
      console.warn('Not enough data rows found');
      return [];
    }

    // 1️⃣ Extract header row
    const [header, ...bodyRows] = rows;

    // 2️⃣ Filter out empty rows
    const filteredRows = bodyRows.filter(row =>
      row.some(cell => cell && cell.toString().trim() !== '')
    );

    // 3️⃣ Map rows to objects using headers as keys
    const structuredData = filteredRows.map(row => {
      const entry = {};
      header.forEach((key, index) => {
        key = key.toLowerCase();
        entry[key] = row[index] || ''; // fallback to empty string if cell is missing
      });
      return entry;
    });

    console.log('Structured Data:', structuredData);
    return structuredData;

  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return [];
  }
}


document.querySelector('.log-data').addEventListener('click', e => {
    console.log('It is Loading...')
    getSheetData(); 
});  

const $dateCreated = document.querySelector('.date-created');
const $arrivalDate = document.querySelector('.arrival-date');
const $datePickerField = document.querySelector('.date');
const $rushOrderWrap = document.querySelector('.rush-order-wrap');
const $normalOrderWrap = document.querySelector('.normal-order-wrap');
const $lastViableDate = document.querySelector('.last-viable-date');
const $dateRange = document.querySelector('.date-range');
const $daysNum = document.querySelector('.days-num');
const $minHrs = document.querySelector('.min-hrs');
const $firstAvailableDate = document.querySelector('.first-available-date'); 
const $firstAvailableDateCapacity = document.querySelector('.first-available-date-capacity'); 
const $firstAvailableDateBooked = document.querySelector('.first-available-date-booked'); 
const $firstAvailableDateTasks = document.querySelector('.first-available-date-tasks-no');
const $dateOpeningsTextArea = document.querySelector('.date-openings');
const today = new Date();
const rushOrderWeeks = 3;
const lowerLimitDaysNum = 10;
const minHrs = 8; // hrs

const fp = flatpickr($datePickerField, {
    mode: 'range',
    altInput: true,
    enableTime: false,
    altFormat: 'D M j',
    dateFormat: 'Y-m-d',
  	// minDate: 'today',
    onClose: (selectedDates, dateStr, instance) => {
        if (selectedDates.length === 0) return;
        checkForCapacityOnDatePickerClose(selectedDates);         
    },
});

async function checkForCapacityOnDatePickerClose(dateArr) {
    const arrivalDate = processArrivalDate(dateArr);
    $dateCreated.textContent = today.toDateString();
    $arrivalDate.textContent = arrivalDate;

    const { weeks } = getDaysNWeeksFromToday(arrivalDate);
    if (weeks <= rushOrderWeeks) {
        $rushOrderWrap.querySelector('.rush-order-alert').innerHTML = 'This is a rush order<br>Needs to be delivered in 3 weeks or less!';
        $rushOrderWrap.classList.remove('hide');
        $normalOrderWrap.classList.add('hide');
        return; 
    }

    const lastViableDateToStartWork  = getLowerLimitDate(arrivalDate, lowerLimitDaysNum);    
    const numberOfDaysAvailableToWork = getNumberOfDaysBetweenDates(today, lastViableDateToStartWork);
    if (numberOfDaysAvailableToWork < 1) {
        $rushOrderWrap.querySelector('.rush-order-alert').innerHTML = `No more available days!\nThe last viable date to start work is on ${lastViableDateToStartWork.toDateString()}`;
        $rushOrderWrap.classList.remove('hide');
        $normalOrderWrap.classList.add('hide');
        return;
    }
    
    $normalOrderWrap.classList.remove('hide');
    $rushOrderWrap.classList.add('hide');
    
    $lastViableDate.textContent = lastViableDateToStartWork.toDateString();
    const todayDate = today.getDate();
    const tomorrow = new Date(new Date(today).setDate(todayDate + 1)).toDateString();
    $dateRange.textContent = `${tomorrow} (tomorrow) to ${lastViableDateToStartWork.toDateString()} (10 days to arrival date)`;
    $daysNum.textContent = `${numberOfDaysAvailableToWork} days to delivery`;
    $minHrs.textContent = minHrs;

    const daysData = await getSheetData();

    // const numberOfDays = getNumberOfDaysBetweenDates(arrivalDate, lastViableDateToStartWork);

    let firstDaySet = false;
    const todayEpoch = today.getTime();
    $dateOpeningsTextArea.value = '';

    for (const day of daysData) {
    // for (let i = 0; i < numberOfDays; i++) {
        const { available, date, capacity } = day;
        if (!available || available.toLowerCase() !== 'true') continue;
        const dateEpoch  = new Date(date).getTime();
        if (todayEpoch > dateEpoch || parseInt(capacity) < parseInt(minHrs)) continue;

        const { booked, max, ['no. of tasks']:noOfTasks } = day;

        const dayInfo = `${date} | ${capacity} capacity | ${booked} booked | ${noOfTasks} tasks`;
        $dateOpeningsTextArea.value = $dateOpeningsTextArea.value + '\n' + dayInfo; 

        if (firstDaySet) continue;
        $firstAvailableDate.textContent = date;
        $firstAvailableDateCapacity.textContent = capacity;
        $firstAvailableDateBooked.textContent = booked;
        $firstAvailableDateTasks.textContent = noOfTasks;
        firstDaySet = true;
    }
}

function processArrivalDate(dateArr) {
    const date = dateArr[0];
    return new Date(date)?.toDateString() || 'No Date';
}  

function getDaysNWeeksFromToday(futureDate) {
  const today = new Date();
  const days = getNumberOfDaysBetweenDates(today, futureDate); 
  const weeks = Math.round(days / 7); 
  return { days, weeks }; 
}

function getLowerLimitDate(theArrivalDate, lowerLimit) {
  const arrivalDate = new Date(theArrivalDate); 
  const lowerLimitDate = arrivalDate.setDate(arrivalDate.getDate() - lowerLimit);
  return new Date(lowerLimitDate);
}

function getNumberOfDaysBetweenDates(fromDate, toDate) {
  const fromDateTime = new Date(fromDate).getTime();
  const toDateTime = new Date(toDate).getTime();
  const oneDayMilliseconds = 1000 * 60 * 60 * 24;
  const days = Math.ceil( ( toDateTime - fromDateTime  ) / oneDayMilliseconds ); 
  return days;
}
