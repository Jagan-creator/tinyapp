const express = require("express");
const app = express();
const PORT = 8080;
const cookie = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookie());

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

const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let results = '';
  for (let i = 6; i > 0; --i) results += chars[Math.round(Math.random() * (chars.length - 1))];
  return results;
};

const confirmURL = (URL, data) => {
  return data[URL];
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const registerUser = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  return id;
};

const findUserEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};

const passwordCheck= (user, password) => {
  if (user.password === password) {
    return true;
  } else {
    return false;
  }
};

const urlsForUser = (id, database) => {
  let userURLS = {};
  for (let key in database) {
    if (database[key].userID === id) {
      userURLS[key] = database[key];
    }
  }
  return userURLS;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//get urls to index page and check for user login
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    res.render("urls_errors");
  } else {
    const userID = req.cookies["user_id"];
    const userURLS = urlsForUser(userID, urlDatabase);
    let templateVars = { urls: userURLS, user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);
  }
});

//new url is posted
app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    res.status(401).send("You must be logged in to shorten a URL!");
  } else {
  const shortURL = generateRandomString();
  const newURL = req.body.longURL
  urlDatabase[shortURL] = { longURL: newURL, userID: req.cookies["user_id"] };
  res.redirect(`/urls/${shortURL}`);
  }
});

//check if user is logged in before creating new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
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
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//post for delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//post for edit
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//get for login
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
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
  if (!passwordCheck(user, password)) {
   return res.status(403).send("Password is incorrect!");
  }
    res.cookie("user_id", user.id);
    res.redirect("/urls");
});

//post for logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//get for register
app.get("/register", (req, res) => {
  templateVars = { user: users[req.cookies["user_id"]] }
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//post for register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(403).send("Please enter a valid email or password!");
  } else if (findUserEmail(email)) {
    res.status(403).send("This email is taken!");
  } else {
    const user_id = registerUser(email, password);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});