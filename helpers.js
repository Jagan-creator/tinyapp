const { users, urlDatabase } = require("./database");

//generates a random string for new user ID's
const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let results = '';
  for (let i = 6; i > 0; --i) results += chars[Math.round(Math.random() * (chars.length - 1))];
  return results;
};

//helps confirm the URL is working
const confirmURL = (URL, data) => {
  return data[URL];
};

//used to reigster user during sign up on tinyapp
const registerUser = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  return id;
};

//confirms if the user email is in the database
const findUserEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};

//helps set urls to specific user ID's
const urlsForUser = (id) => {
  let userURLS = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURLS[key] = urlDatabase[key];
    }
  }
  return userURLS;
};

module.exports = { generateRandomString, confirmURL, registerUser, findUserEmail, urlsForUser };