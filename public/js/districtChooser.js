const radios = document.getElementsByName('searchBy');
const spinner = document.getElementById('spinner');
const results = document.getElementById('results');
const states = document.getElementById('states');
const districts = document.getElementById('districts');

fetchStates();

states.addEventListener('change', (event) => fetchDistricts(event.target.value));

radios.forEach(radio => {
    const searchByPinForm = document.getElementById('searchByPinForm');
    const searchByDistrictForm = document.getElementById('searchByDistrictForm');
    radio.addEventListener('change', (event) => {
        if (event.target.value === 'searchByPin') {
            searchByPinForm.style.display = 'block';
            searchByDistrictForm.style.display = 'none';
        } else {
            searchByPinForm.style.display = 'none';
            searchByDistrictForm.style.display = 'block';
        }
    })
})

function getAvailableSlotsByPINCode(pincode) {
    if (!pincode || Number(pincode) === NaN || pincode.length !== 6) {
        showSnackBar()
    } else {
        const currentDate = new Date().toJSON().slice(0, 10);
        spinner.style.display = 'block';
        fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${DDMMYYYYConverter(currentDate)}`).then((response) => {
            return response.json();
        }).then((JSONCalendarResponse) => {
            spinner.style.display = 'none';
            displayCalendarResponse(currentDate, JSONCalendarResponse);
        });
    }
}

function getAvailableSlotsByDistrict(districtID) {
    const currentDate = new Date().toJSON().slice(0, 10);
    spinner.style.display = 'block';
    fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtID}&date=${DDMMYYYYConverter(currentDate)}`).then((response) => {
        return response.json();
    }).then((JSONCalendarResponse) => {
        spinner.style.display = 'none';
        displayCalendarResponse(currentDate, JSONCalendarResponse);
    });
}

function addDaysToDate(date, days) {
    return DDMMYYYYConverter(new Date(new Date().setDate(new Date(date).getDate() + days)).toJSON().slice(0, 10));
}

function DDMMYYYYConverter(date) {
    return date.split('-').reverse().join('-')
}

function showSnackBar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function displayCalendarResponse(currentDate, JSONCalendarResponse) {
    results.innerHTML = '';
    const headers = ['Vaccination Center', addDaysToDate(currentDate, 0), addDaysToDate(currentDate, 1), addDaysToDate(currentDate, 2), addDaysToDate(currentDate, 3), addDaysToDate(currentDate, 4), addDaysToDate(currentDate, 5), addDaysToDate(currentDate, 6)];
    const table = document.createElement('table');
    table.classList.add('table');
    const tableHeader = document.createElement('thead');
    const tableHeaderRow = document.createElement('tr');
    headers.forEach(header => {
        const rowElement = document.createElement('th');
        rowElement.setAttribute('scope', 'col');
        rowElement.innerHTML = header
        tableHeaderRow.appendChild(rowElement);
    });
    tableHeader.appendChild(tableHeaderRow);
    const tableBody = document.createElement('tbody');
    JSONCalendarResponse.centers.forEach(center => {
        const currentRow = document.createElement('tr');
        const addressElement = document.createElement('th');
        addressElement.innerHTML = `${center.name}<br><span class="address text-secondary fw-light">${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode}</span>`;
        currentRow.appendChild(addressElement);
        let addedElements = 0;
        center.sessions.forEach(session => {
            if (addedElements < 7) {
                const rowElement = document.createElement('td');
                rowElement.classList.add('text-center');
                rowElement.innerHTML = session.available_capacity > 0 ? `<span class="vaccine badge bg-light text-dark minAge text-wrap">${session.vaccine}</span><br><span class="text-success fw-bolder">${session.available_capacity}</span><br><span class="minAge badge bg-light text-dark minAge text-wrap">${session.min_age_limit}+</span>` : '<span class="text-danger fw-bold">Not Available</span>';
                currentRow.appendChild(rowElement);
                addedElements++;
            }
        });
        if (center.sessions.length < 7) {
            const lessSessions = 7 - center.sessions.length;
            for (let i = 0; i < lessSessions; i++) {
                const el = document.createElement('td');
                el.classList.add('text-center');
                el.innerHTML = '<span class="text-danger fw-bold">Not Available</span>'
                currentRow.appendChild(el);
            }
        }
        tableBody.appendChild(currentRow);
    });
    table.appendChild(tableHeader);
    table.appendChild(tableBody);
    results.appendChild(table);
    if (!JSONCalendarResponse.centers.length) {
        const errorNotice = document.createElement('p');
        errorNotice.classList.add('text-center');
        errorNotice.classList.add('mt-3');
        errorNotice.classList.add('fw-bold');
        errorNotice.classList.add('text-danger');
        errorNotice.innerHTML = 'No results found'
        results.appendChild(errorNotice);
    }
}

function fetchStates() {
    fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states").then(response => response.json()).then(json => {
        json.states.forEach(state => {
            const optionElement = document.createElement('option');
            optionElement.value = state.state_id;
            optionElement.innerHTML = state.state_name;
            states.appendChild(optionElement);
        });
    });
}

function fetchDistricts(stateId) {
    results.innerHTML = '';
    fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`).then(response => response.json()).then(json => {
        districts.innerHTML = '';
        const emptyOptionElement = document.createElement('option');
        emptyOptionElement.setAttribute('selected', 'true');
        emptyOptionElement.setAttribute('disabled', 'true');
        emptyOptionElement.innerHTML = 'Select a district';
        districts.appendChild(emptyOptionElement);
        json.districts.forEach(district => {
            const optionElement = document.createElement('option');
            optionElement.value = district.district_id;
            optionElement.innerHTML = district.district_name;
            districts.appendChild(optionElement);
        });
    });
}
