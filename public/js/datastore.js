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
const noNotifier = document.getElementById("noNotifier");
const accounts = document.getElementById("accounts");
const model = document.getElementById("close-button");
fetchStates();
renderCards();
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    fullName.innerHTML = user.displayName;
    email.innerHTML = user.email;
  }
});

states.addEventListener("change", (event) => {
  const value = event.target.value;
  fetchDistricts(value);
});
function renderCards() {
  accounts.innerHTML = "";
  const userId = localStorage.getItem("UID");
  fetch(`account/getaccounts/${userId}`)
    .then((response) => response.json())
    .then((json) => {
      accountLoader.style.display = "none";
      accountDetails.style.display = "block";
      if (json.length) {
        noNotifier.style.display = "none";
        json.forEach((account) => {
          const colDiv = document.createElement("div");
          colDiv.classList.add("col-sm-12", "col-md-4");
          const card = document.createElement("div");
          card.classList.add("card", "w-100", "mt-2");
          const divHead = document.createElement("div");
          divHead.classList.add("card-header", "text-center");
          if (account.notify_with === "district") {
            fetch(
              `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${account.state_id}`
            )
              .then((response) => response.json())
              .then((json) => {
                const district = json.districts.filter(
                  (dist) => dist.district_id === parseInt(account.district_id)
                )[0].district_name;
                divHead.innerHTML = district;
              });
          } else {
            divHead.innerHTML = account.pincode;
          }
          const ul = document.createElement("ul");
          ul.classList.add("list-group", "list-group-flush");
          const li1 = document.createElement("li");
          li1.classList.add("list-group-item");
          li1.innerHTML = `<b>Notify for age:</b>  ${
            account.notify_ages === "all" ? "All" : account.notify_ages + `+`
          }`;
          const li2 = document.createElement("li");
          li2.classList.add("list-group-item");
          li2.innerHTML = `<b>Available Vaccine:</b> ${
            account.next_available_vaccine !== "null"
              ? account.next_available_vaccine
              : "None"
          }`;
          ul.appendChild(li1);
          ul.appendChild(li2);
          const divFooter = document.createElement("div");
          divFooter.classList.add("card-footer", "text-end");
          const btnRemove = document.createElement("button");
          btnRemove.classList.add("btn", "btn-danger");
          btnRemove.innerHTML = "Delete Notifier";
          btnRemove.addEventListener("click", () => {
            deleteAccount(account.id);
          });
          divFooter.appendChild(btnRemove);
          card.appendChild(divHead);
          card.appendChild(ul);
          card.appendChild(divFooter);
          colDiv.appendChild(card);
          accounts.appendChild(colDiv);
        });
      }
    });
}

function deleteAccount(id) {
  fetch(`account/deleteaccount/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((res) => renderCards());
}

const checkInputs = () => {
  if (!age.value) {
    document.getElementById("addNewNotifier").disabled = true;
  } else {
    if (
      (notifyWith.value === "pincode" && !pincode.value) ||
      (notifyWith.value === "district" &&
        districts.value === "Select a district") ||
      age.classList.contains("is-invalid") ||
      pincode.classList.contains("is-invalid")
    ) {
      document.getElementById("addNewNotifier").disabled = true;
    } else {
      document.getElementById("addNewNotifier").disabled = false;
    }
  }
};

function addNewNotifier() {
  const params = {
    userid: localStorage.getItem("UID"),
    pincode: pincode.value ? pincode.value : "null",
    notify_with: notifyWith.value,
    state_id: states.value !== "Select a state" ? states.value : "null",
    district_id:
      districts.value !== "Select a district" ? districts.value : "null",
    age: age.value,
    notify_ages: notifyForAges.value,
  };
  const url = "account/addaccount";
  const option = {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  fetch(url, option)
    .then((res) => res.json())
    .then((response) => {
      pincode.value = "";
      age.value = "";
      districts.value = "Select a district";
      states.value = "Select a state";
      notifyForAges.value = "all";
      notifyWith.value = "pincode";
      model.click();
    });

  renderCards();
}
age.addEventListener("keyup", (event) => {
  const value = event.target.value;
  if (
    !value ||
    isNaN(Number(value)) ||
    Number(value) < 1 ||
    Number(value) > 99
  ) {
    age.classList.add("is-invalid");
  } else {
    age.classList.remove("is-invalid");
  }
  checkInputs();
});
notifyWith.addEventListener("change", () => {
  if (
    pincode.classList.contains("is-invalid") &&
    notifyWith.value === "district"
  ) {
    pincode.classList.remove("is-invalid");
  }
  checkInputs();
});
states.addEventListener("change", () => {
  checkInputs();
});
districts.addEventListener("change", () => {
  checkInputs();
});
pincode.addEventListener("keyup", (event) => {
  const value = event.target.value;
  if (!value || isNaN(Number(value)) || value.length !== 6) {
    pincode.classList.add("is-invalid");
  } else {
    pincode.classList.remove("is-invalid");
  }
  checkInputs();
});
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
