const express = require("express");
const cors = require("cors")({
  origin: true,
});
const app = express();
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
const cron = require("node-cron");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const sqlConnectionPool = require("./sqlConnectionPool");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();

app.use(cors);
app.options("*", cors);
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

app.get("/account/getaccounts/:uid", (req, res) => {
  const userid = req.params.uid;
  sqlConnectionPool
    .createConnectionPool()
    .getConnection()
    .then((connection) => {
      connection
        .query(`SELECT * from accounts WHERE userid = '${userid}';`)
        .then((rows) => {
          res.send(rows);
        })
        .catch((err) => {
          console.log(err);
          connection.release();
        })
        .finally(() => {
          connection.release();
        });
    });
});

app.delete("/account/deleteaccount/:id", (req, res) => {
  const id = req.params.id;
  sqlConnectionPool
    .createConnectionPool()
    .getConnection()
    .then((connection) => {
      connection
        .query(`DELETE FROM accounts WHERE id ='${id}';`)
        .then((rows) => {
          res.send(true);
        })
        .catch((err) => {
          console.log(err);
          res.send(false);
          connection.release();
        })
        .finally(() => {
          connection.release();
        });
    });
});

app.post("/account/addaccount", (req, res) => {
  let query = `INSERT INTO accounts (userid, last_notified, pincode, notify_with, state_id, district_id, age, notify_ages, next_available_vaccine) VALUES (`;
  query += `'${req.body.userid}',`;
  query += `NULL,`;
  query += req.body.pincode ? `'${req.body.pincode}',` : "NULL,";
  query += req.body.notify_with ? `'${req.body.notify_with}',` : "NULL,";
  query += req.body.state_id ? `'${req.body.state_id}',` : "NULL,";
  query += req.body.district_id ? `'${req.body.district_id}',` : "NULL,";
  query += req.body.age ? `'${req.body.age}',` : "NULL,";
  query += req.body.notify_ages ? `'${req.body.notify_ages}',` : "NULL,";
  query += `NULL);`;

  sqlConnectionPool
    .createConnectionPool()
    .getConnection()
    .then((connection) => {
      connection
        .query(query)
        .then((rows) => {
          res.send(true);
        })
        .catch((err) => {
          console.log(err);
          res.send(false);
          connection.release();
        })
        .finally(() => {
          connection.release();
        });
    });
});

// const serviceAccount = JSON.parse(
//   Buffer.from(process.env.SERVICE_ACCOUNT_KEY, "base64").toString()
// );
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
// const db = admin.firestore();

cron.schedule("* * * * *", () => {
  checkAvailability();
});

function checkAvailability() {
  sqlConnectionPool
    .createConnectionPool()
    .getConnection()
    .then((connection) => {
      connection
        .query(`SELECT * from accounts;`)
        .then((rows) => {
          rows.forEach((row) => {
            if (
              !row.last_notified ||
              row.last_notified !==
              addDaysToDate(new Date().toJSON().slice(0, 10), 1)
            ) {
              if (row.pincode && row.pincode !== "null" && row.notify_with === "pincode") {
                findDatesByPIN(row.id, row);
              }
              if (row.dstrict_id && row.dstrict_id !== "null" && row.notify_with === "district") {
                findDatesByDistrict(row.id, row);
              }
            }
          });
        })
        .catch((err) => {
          console.log(err);
          res.send(false);
          connection.release();
        })
        .finally(() => {
          connection.release();
        });
    });
  // db.collection("users")
  //   .get()
  //   .then((snapshot) => {
  //     snapshot.forEach((doc) => {
  //       if (
  //         !doc.data().lastNotified ||
  //         doc.data().lastNotified !==
  //         addDaysToDate(new Date().toJSON().slice(0, 10), 1)
  //       ) {
  //         if (doc.data().pincode && doc.data().notifyWith === "pincode") {
  //           findDatesByPIN(doc.id, doc.data());
  //         }

  //         if (doc.data().notifyWith === "district" && doc.data().districtID) {
  //           findDatesByDistrict(doc.id, doc.data());
  //         }
  //       } else {
  //         //
  //       }
  //     });
  //   });
}

function findDatesByDistrict(id, user) {
  const currentDate = addDaysToDate(new Date().toJSON().slice(0, 10), 1);
  fetch(
    `${process.env.SERVER_ADDRESS}district?district_id=${user.district_id}&date=${currentDate}`
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
    })
    .then((JSONCalendarResponse) => {
      saveResponse(currentDate, id, user, JSONCalendarResponse);
    })
    .catch((error) => {
      console.log(error);
    });
}

function findDatesByPIN(id, user) {
  const currentDate = addDaysToDate(new Date().toJSON().slice(0, 10), 1);
  fetch(
    `${process.env.SERVER_ADDRESS}pin?pincode=${user.pincode}&date=${currentDate}`
  )
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
    })
    .then((JSONCalendarResponse) => {
      saveResponse(currentDate, id, user, JSONCalendarResponse);
    })
    .catch((error) => {
      console.log(error);
    });
}

function saveResponse(currentDate, id, user, JSONCalendarResponse) {
  const added = [];
  // const collectionRef = db.collection("users").doc(id);
  if (JSONCalendarResponse && JSONCalendarResponse.centers) {
    JSONCalendarResponse.centers.forEach((center) => {
      if (!added.length) {
        if (center.sessions) {
          center.sessions.forEach((session) => {
            if (session.available_capacity > 0) {
              if (
                user.notifyForAges == "all" ||
                user.notifyForAges === session.min_age_limit
              ) {
                added[0] = {
                  lastNotified: currentDate,
                  nextAvailableVaccine: `${session.vaccine} - ${session.available_capacity} slots available at ${center.name} - ${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode} on ${session.date}`,
                };
                sqlConnectionPool.createConnectionPool().getConnection().then((connection) => {
                  connection.query(`UPDATE users SET last_notified = '${currentDate}', next_available_vaccine = '${session.vaccine} - ${session.available_capacity} slots available at ${center.name} - ${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode} on ${session.date}' WHERE id = '${id}';`).then((rows) => {
                    console.log(rows);
                  }).catch((err) => {
                    console.log(err);
                    res.send(false);
                    connection.release();
                  }).finally(() => {
                    connection.release();
                  });
                });
                // collectionRef.update({
                //   lastNotified: currentDate,
                //   nextAvailableVaccine: `${session.vaccine} - ${session.available_capacity} slots available at ${center.name} - ${center.address}, ${center.district_name}, ${center.state_name} - ${center.pincode} on ${session.date}`,
                // });
              }
            }
          });
        }
      }
    });
  }

  if (!added.length) {
    // No vaccines found
    sqlConnectionPool.createConnectionPool().getConnection().then((connection) => {
      connection.query(`UPDATE users SET last_notified = NULL, next_available_vaccine = NULL WHERE id = '${id}';`).then((rows) => {
        console.log(rows);
      }).catch((err) => {
        console.log(err);
        res.send(false);
        connection.release();
      }).finally(() => {
        connection.release();
      });
    });
  } else {
    sendEmail(
      user.email,
      "VACCINE AVAILABLE",
      added[0].nextAvailableVaccine,
      (error, result) => {
        if (error) {
          console.error(error);
        }
      }
    );
  }
}

function addDaysToDate(date, days) {
  return DDMMYYYYConverter(
    new Date(new Date().setDate(new Date(date).getDate() + days))
      .toJSON()
      .slice(0, 10)
  );
}

function DDMMYYYYConverter(date) {
  return date.split("-").reverse().join("-");
}
let nodemailerTransporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: String(process.env.EMAIL_ADDRESS),
    pass: String(process.env.EMAIL_PASSWORD),
  },
});

function sendEmail(email, subjectLine, slotDetails, callback) {
  let options = {
    from: String("Vaccinosaurus" + process.env.EMAIL_ADDRESS),
    to: email,
    subject: subjectLine,
    text: "Vaccine available. Details: \n\n" + slotDetails,
  };
  nodemailerTransporter.sendMail(options, (error, info) => {
    if (error) {
      return callback(error);
    }
    callback(error, info);
  });
}

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
