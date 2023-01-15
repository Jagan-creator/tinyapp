const bcrypt = require("bcryptjs");

//storage of URL's in the database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

//storage fo user information in the database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("passwordOne", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("passwordTwo", 10),
  },
};

module.exports = { urlDatabase, users };