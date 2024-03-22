const { assert } = require('chai')

const { getUserByEmail } = require('../helpers.js')

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedEmail = "user@example.com"
		//
		assert.strictEqual(user.email, expectedEmail)
  });

	it('should return undefined if email is not found', function() {
    const user = getUserByEmail("noUser@example.com", testUsers)
		const expected = undefined
		//
		assert.strictEqual(user.email, expected)
  });
});