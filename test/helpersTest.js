const { assert, expect } = require('chai');

const { findUserEmail } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
};

describe("findUserEmail", function() {
  it('should return a user with valid email', function() {
    const user = findUserEmail('user@example.com', testUsers)
    const expectedUserID = 'user@example.com';
    assert.equal(user.email, expectedUserID);
  });
  it('should return undefined with an invalid user', function() {
    const user = findUserEmail('userRandomID', testUsers)
    assert.equal(user, undefined);
  });
});