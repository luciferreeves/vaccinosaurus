const express = require("express");
const cors = require("cors")({origin: true});
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
