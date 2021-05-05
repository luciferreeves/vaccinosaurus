const radios = document.getElementsByName('searchBy');
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
        console.log('Valid')
    }
}

function showSnackBar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}
