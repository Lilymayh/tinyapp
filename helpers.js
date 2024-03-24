//Export function for use in express_server.js.
const getUserByEmail = function(email, users) {
  const userList = Object.values(users);
  //Create userList array to loop over
  for (let user of userList) {
    //If email is found return user
    if (user.email === email) {
      return user;
    }
  }
  //If the user is not found, return undefined.
  return undefined;
};

//Export function for use in express_server.js.
const generateRandomString = function() {
  //Variable to store randomly generated string.
  let newStr = '';
  //Store alphabet + numbers 1-9 to loop over
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz123456789';
  //Loop over alphaNum 6 times and add 6 different letters/nums to newStr.
  for (let i = 0; i < 6; i++) {
    const randomStr = (Math.floor(Math.random() * alphaNum.length));
    newStr += alphaNum[randomStr];
  }
  //OUTPUT: a string of 6 random alpha-numeric charachters
  return newStr;
};

module.exports = { getUserByEmail, generateRandomString };