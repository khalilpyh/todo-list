const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

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
  name: "Welcome to use the ToDoList.",
});
const item2 = new Item({
  name: "Click + button to add a new item.",
});
const item3 = new Item({
  name: "Create your custom list.",
});
const item4 = new Item({
  name: "Add a list name to the url after /",
});
const defaultItems = [item1, item2, item3, item4];

//create custom list schema
const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: [itemsSchema],
});

//create custom list model
const List = mongoose.model("List", listSchema);

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

//Landing Page - Post (Add items)
app.post("/", function (req, res) {
  //retrieve user input item name
  let itemName = req.body.newItem;
  //retrieve list title (default list/custom list)
  let listName = req.body.listTitleButton;

  //create a new item object and save to database
  const newItem = new Item({
    name: itemName,
  });

  //get today's date that matches the default list title
  const defaultTitle = date.getDate().split(",")[0] + ",";

  //add item to the database base on different page button post
  if (listName == defaultTitle) {
    newItem
      .save()
      .then(() => {
        console.log("Successfully added the new item.");
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + foundList.name);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

//Landing Page - Post (Delete items)
app.post("/delete", function (req, res) {
  //get the id of the item that is checked
  const checkedItemID = req.body.itemCheckbox;
  //retrieve list title (default list/custom list)
  let listName = req.body.listTitleHidden;

  console.log(listName);

  //check for which list to delete item
  if (listName == date.getDate()) {
    //delete the item from default list
    Item.findByIdAndRemove(checkedItemID)
      .then(() => {
        console.log("Successfully deleted the checked item.");
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect("/");
  } else {
    //delete item from custom list
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemID } } } //find the item in items array that matches the id and delete it
    )
      .then(() => {
        console.log("Successfully deleted the checked item.");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/" + listName);
  }
});

//Custom Page - Get
app.get("/:customListName", function (req, res) {
  //get the route param
  const customListName = _.capitalize(req.params.customListName); //Converts the first character of string to upper case and the remaining to lower case.

  //check if that customList already exists
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        //create the new list if dose not exist
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

//About Page - Get
app.get("/about", function (req, res) {
  res.render("about");
});

//Set up Port
app.listen(3000, function () {
  console.log("Server is runing on port 3000.");
});
