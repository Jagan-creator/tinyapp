// REQUIRED
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, confirmURL, registerUser, findUserEmail, urlsForUser } = require("./helpers.js");
const { urlDatabase, users } = require("./database");
const app = express();
const PORT = 8080;

// MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["user_id"]
}));

// GET AND POST CALLS
// redirects user to /urls if they are logged in and /login if they are not
app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// redirects user to register or login if they have not or sends to urls_index if they have
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.render("urls_errors");
  } else {
    const userID = req.session.user_id;
    const userURLS = urlsForUser(userID);
    let templateVars = { urls: userURLS, user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  }
});

//requires user to login and if they are then they can shorten URL's
app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.status(401).send("You must be logged in to shorten a URL!");
  } else {
    const shortURL = generateRandomString();
    const newURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: newURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  }
});

//requires user to login and if they are then they can access the page to make new URL's
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//render shortURL page with appropriate information
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  if (!templateVars.user) {
    return res.status(400).send(`You need to be <a href="/login">logged in</a> to view this short URL`);
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to view this URL");
  } else if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("You are not able to visit this page!");
  }
});

//checks to see if long URL is working and if so it will redirect the user to the new page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (confirmURL(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

//checks if user is able to edit URL from given link and then redirects to /urls if they are able to
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to edit this URL");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//checks if user is able to delete URL and then redirects to /urls if they are able to
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to delete this URL");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//checks if user is able to edit URL and then redirects to /urls if they are able to
app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to edit this URL");
  }
  const shortURL = req.params.shortURL;
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//if already logged in it will redirect to /urls and if not it will render the login page
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

//checks if the user email and password is in the database to accept login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserEmail(email);
  if (!user) {
    return res.status(403).send("Email does not exist!");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password is incorrect!");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//logging out will redirect you back to the login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//checks if user is already logged in and if not the server will render the registration page
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//checks if email is already taken for registration and that they have entered a valid email and password
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || password === '') {
    res.status(403).send("Please enter a valid email or password!");
  } else if (findUserEmail(email)) {
    res.status(403).send("This email is taken!");
  } else {
    const newUserID = registerUser(email, hashedPassword);
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});