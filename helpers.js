const { users, urlDatabase } = require("./database");

const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let results = '';
  for (let i = 6; i > 0; --i) results += chars[Math.round(Math.random() * (chars.length - 1))];
  return results;
};

const confirmURL = (URL, data) => {
  return data[URL];
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