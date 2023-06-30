const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); //user body parser
app.use(express.static("public"));

//set up EJS
app.set("view engine", "ejs");

//declare a list to hold new items
let items = ["Buy Food", "Cook Food", "Eat Food"]; //fill with sample items
let workItems = [];

//Landing Page - Get
app.get("/", function (req, res) {
  //get the current date
  let day = date.getDate();

  res.render("list", { listTitle: day, newListItems: items });
});

//Landing Page - Post
app.post("/", function (req, res) {
  //retrieve user input item
  let newItem = req.body.newItem;

  //add item base on differenct page button post
  if (req.body.list === "Work") {
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    items.push(newItem);
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
