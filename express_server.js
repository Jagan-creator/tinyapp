const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, confirmURL, registerUser, findUserEmail, urlsForUser } = require("./helpers.js");
const { urlDatabase, users } = require("./database");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["user_id"]
}))

app.get("/", (req, res) => {
  res.send("Hello!");
});

//get urls to index page and check for user login
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

//new url is posted
app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.status(401).send("You must be logged in to shorten a URL!");
  } else {
  const shortURL = generateRandomString();
  const newURL = req.body.longURL
  urlDatabase[shortURL] = { longURL: newURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
  }
});

//check if user is logged in before creating new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (confirmURL(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("The URL you are requesting is not available.");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to edit this URL");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//post for delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to delete this URL");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//post for edit
app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send("You are not able to edit this URL");
  }
  const shortURL = req.params.shortURL;
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//get for login
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

//post for login which checks if email matches and then password match
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

//post for logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//get for register
app.get("/register", (req, res) => {
  templateVars = { user: users[req.session.user_id] }
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//post for register
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