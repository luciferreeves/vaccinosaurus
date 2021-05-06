const express = require("express");
const cors = require("cors")({ origin: true });
const app = express();
const port = process.env.PORT || 3000;
const admin = require('firebase-admin');
const cron = require('node-cron');
const fetch = require('node-fetch');

require('dotenv').config()

app.use(cors);
app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "pug");
app.locals.pretty = true;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/notify", (req, res) => {
  res.render("notify");
});

app.get("/account", (req, res) => {
  res.render("account");
});

const serviceAccount = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

cron.schedule('* * * * *', () => {
  checkAvailability();
});

function checkAvailability() {
  db.collection('users').get().then(snapshot => {
    snapshot.forEach((doc) => {
      if (!doc.data().lastNotified || doc.data().lastNotified !== addDaysToDate(new Date().toJSON().slice(0, 10), 1)) {
        if (doc.data().pincode && doc.data().notifyWith === 'pincode') {
          findDatesByPIN(doc.id, doc.data())
        }

        if (doc.data().notifyWith === 'district' && doc.data().districtID) {
          findDatesByDistrict(doc.id, doc.data())
        }
      } else {
        console.log('already notified today')
      }
    });
  });
}

function findDatesByDistrict(id, user) {
  const currentDate = addDaysToDate(new Date().toJSON().slice(0, 10), 1);
  fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${user.districtID}&date=${currentDate}`).then((response) => {
    return response.json();
  }).then((JSONCalendarResponse) => {
    saveResponse(currentDate, id, user, JSONCalendarResponse)
  });
}

function findDatesByPIN(id, user) {
  const currentDate = addDaysToDate(new Date().toJSON().slice(0, 10), 1);
  fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${user.pincode}&date=${currentDate}`).then((response) => {
    return response.json();
  }).then((JSONCalendarResponse) => {
    saveResponse(currentDate, id, user, JSONCalendarResponse)
  });
}

function saveResponse(currentDate, id, user, JSONCalendarResponse) {
  const added = [];
  const collectionRef = db.collection("users").doc(id);
  JSONCalendarResponse.centers.forEach(center => {
    if (!added.length) {
      if (center.sessions) {
        center.sessions.forEach(session => {
          if (session.available_capacity > 0) {
            if (user.notifyForAges == 'all' || user.notifyForAges === session.min_age_limit) {
              added[0] = {
                lastNotified: currentDate,
                nextAvailableVaccine: `${session.vaccine} - ${session.available_capacity} slots available at ${center.name} - ${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode}`
              }
              collectionRef.update({
                lastNotified: currentDate,
                nextAvailableVaccine: `${session.vaccine} - ${session.available_capacity} slots available at ${center.name} - ${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode}`
              })
            }
          }
        });
      }
    }
  });

  if (!added.length) {
    // No vaccines found
    collectionRef.update({
      lastNotified: null,
      nextAvailableVaccine: null
    })
  }
}

function addDaysToDate(date, days) {
  return DDMMYYYYConverter(new Date(new Date().setDate(new Date(date).getDate() + days)).toJSON().slice(0, 10));
}

function DDMMYYYYConverter(date) {
  return date.split('-').reverse().join('-')
}



app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
