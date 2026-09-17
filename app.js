const express = require("express");
const app = express();
const port = 3000;
const routes = require("./routes");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
