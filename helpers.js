const getUserByEmail = function(email, users) {
	//Loop through users.
  for (let existingUser in users) {
		//If email is found return user
    if (users[existingUser].email === email) {
      return users[existingUser];
    }
  }
	//Else return false/didn't find the user.
  return false;
};

module.exports = { getUserByEmail }