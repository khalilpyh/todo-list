const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); //user body parser
app.use(express.static("public"));

//set up EJS
app.set("view engine", "ejs");

//connect to MongoDB and create a database to hold todo items
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
});

//create database schema
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

//create database model
const Item = mongoose.model("Item", itemsSchema);

//supply some sample items as default data
const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});

const defaultItems = [item1, item2, item3];

// //declare a list to hold new items
// let items = ["Buy Food", "Cook Food", "Eat Food"]; //fill with sample items
let workItems = [];

//Landing Page - Get
app.get("/", function (req, res) {
  //get the current date
  let day = date.getDate();

  //display all the items retrieved from the database
  Item.find()
    .then((foundItems) => {
      //if database is empty, insert some default items into database
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully added the default items.");
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: foundItems });
      }
    })
    .catch((err) => console.log(err));
});

//Landing Page - Post
app.post("/", function (req, res) {
  //retrieve user input item name
  let itemName = req.body.newItem;

  //add item tp the database base on differenct page button post
  if (req.body.list === "Work") {
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    //create a new item object and save to database
    const newItem = new Item({
      name: itemName,
    });

    newItem.save()
      .then(() => {
        console.log("Successfully added the new item.");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  }
});

//Work Page - Get
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

//Work Page - Post
app.post("/work", function (req, res) {
  //retrieve user input item and add to item list
  let workItem = req.body.newItem;
  workItems.push(newItem);

  res.redirect("/work");
});

//About Page - Get
app.get("/about", function (req, res) {
  res.render("about");
});

//Set up Port
app.listen(3000, function () {
  console.log("Server is runing on port 3000.");
});
