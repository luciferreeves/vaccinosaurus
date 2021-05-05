const express = require("express");
const cors = require("cors")({origin: true});
const app = express();
const port = process.env.PORT || 3000;

app.use(cors);
app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
