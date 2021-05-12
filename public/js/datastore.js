const db = firebase.firestore();
const accountLoader = document.getElementById("accountLoader");
const accountDetails = document.getElementById("accountDetails");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const incompleteAccount = document.getElementById("incompleteAccount");
const notifyForAges = document.getElementById("notifyForAges");
const pincode = document.getElementById("pincode");
const age = document.getElementById("age");
const states = document.getElementById("states");
const districts = document.getElementById("districts");
const notifyWith = document.getElementById("notifyWith");
const vaccineInformationAlert = document.getElementById(
  "vaccineInformationAlert"
);
const vaccineInformation = document.getElementById("vaccineInformation");

fetchStates();

// firebase.auth().onAuthStateChanged((user) => {
// if (user) {
//     checkDataConsistency(user);
//     const collectionRef = db.collection("users").doc(user.uid);
//     collectionRef.onSnapshot((doc) => {
//         if (doc.exists) {
//             accountLoader.style.display = 'none';
//             accountDetails.style.display = 'block';
//             fullName.innerHTML = user.displayName;
//             email.innerHTML = user.email;
//             if (!doc.data().age || doc.data().notifyWith === 'pincode' && !doc.data().pincode || doc.data().notifyWith === 'district' && !doc.data().districtID) {
//                 incompleteAccount.style.display = 'block';
//                 vaccineInformationAlert.style.display = 'none';
//             } else {
//                 incompleteAccount.style.display = 'none';
//                 vaccineInformationAlert.style.display = 'block';
//             }

//             if (doc.data().age) {
//                 age.value = doc.data().age;
//             }

//             if (doc.data().pincode) {
//                 pincode.value = doc.data().pincode;
//             }

//             if (doc.data().stateID) {
//                 states.value = doc.data().stateID;
//                 if (doc.data().districtID) {
//                     fetchDistricts(doc.data().stateID, doc.data().districtID);
//                 }
//             }

//             if (doc.data().nextAvailableVaccine) {
//                 vaccineInformation.innerHTML = doc.data().nextAvailableVaccine
//             } else {
//                 vaccineInformation.innerHTML = 'No vaccines available currently.'
//             }

//             notifyForAges.value = doc.data().notifyForAges;
//             notifyWith.value = doc.data().notifyWith;
//         }
//     })

//     age.addEventListener('keyup', (event) => {
//         const value = event.target.value;
//         if (!value || isNaN(Number(value)) || Number(value) < 1 || Number(value) > 99) {
//             age.classList.add('is-invalid');
//         } else {
//             age.classList.remove('is-invalid');
//             collectionRef.update({
//                 age: value,
//                 lastNotified: null,
//                 nextAvailableVaccine: null
//             })
//         }
//     })

//     pincode.addEventListener('keyup', (event) => {
//         const value = event.target.value;
//         if (!value || isNaN(Number(value)) || value.length !== 6) {
//             pincode.classList.add('is-invalid');
//         } else {
//             pincode.classList.remove('is-invalid');
//             collectionRef.update({
//                 pincode: value,
//                 lastNotified: null,
//                 nextAvailableVaccine: null
//             })
//         }
//     })

//     states.addEventListener('change', (event) => {
//         const value = event.target.value;
//         collectionRef.update({
//             stateID: value
//         })
//         fetchDistricts(value)
//     });

//     districts.addEventListener('change', (event) => {
//         const value = event.target.value;
//         collectionRef.update({
//             districtID: value,
//             lastNotified: null,
//             nextAvailableVaccine: null
//         })
//     });

//     notifyWith.addEventListener('change', (event) => {
//         const value = event.target.value;
//         collectionRef.update({
//             notifyWith: value,
//             lastNotified: null,
//             nextAvailableVaccine: null
//         })
//     })

//     notifyForAges.addEventListener('change', (event) => {
//         const value = event.target.value;
//         collectionRef.update({
//             notifyForAges: value,
//             lastNotified: null,
//             nextAvailableVaccine: null
//         })
//     })

// }
// });

function fetchStates() {
  fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
    .then((response) => response.json())
    .then((json) => {
      json.states.forEach((state) => {
        const optionElement = document.createElement("option");
        optionElement.value = state.state_id;
        optionElement.innerHTML = state.state_name;
        states.appendChild(optionElement);
      });
    });
}

function fetchDistricts(stateId, districtID = null) {
  fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`)
    .then((response) => response.json())
    .then((json) => {
      districts.innerHTML = "";
      const emptyOptionElement = document.createElement("option");
      emptyOptionElement.setAttribute("selected", "true");
      emptyOptionElement.setAttribute("disabled", "true");
      emptyOptionElement.innerHTML = "Select a district";
      districts.appendChild(emptyOptionElement);
      json.districts.forEach((district) => {
        const optionElement = document.createElement("option");
        optionElement.value = district.district_id;
        optionElement.innerHTML = district.district_name;
        districts.appendChild(optionElement);
      });
      if (districtID) {
        districts.value = districtID;
      }
    });
}

function checkDataConsistency(user) {
  const collectionRef = db.collection("users").doc(user.uid);
  collectionRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        collectionRef.set({
          email: user.email,
          lastNotified: null,
          notifyWith: "pincode",
          pincode: null,
          districtID: null,
          stateID: null,
          age: null,
          notifyForAges: "all",
          nextAvailableVaccine: null,
        });
      }
    })
    .catch(() => {
      alert("Error getting account details. Please reload the page.");
    });
}
