require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
//mongoose
const mongoose = require("mongoose");

//models
// const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//   User.findById("6370ab72bebce2bc8640033b")
//     .then((user) => {
//       req.user = new User(user.username, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(3000, () => {
      console.log("server started at port 3k");
    });
  })
  .catch((err) => {
    console.log(err);
  });
