const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { getUrlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//Middleware to parse.
app.use(express.urlencoded({ extended: true }));

// add this line
app.use(express.json());

//middleware for cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "h5n3se",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "h5n3se"
  }
};

//store users in object
const users = {
  user1ID: {
    id: "user1ID",
    email: "email@e.e",
    password: "password"
  },
};

app.get('/', (req, res) => {
  //If user is logged in, direct them to urls.
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  //If user is not logged in, direct them to /login.
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  //If the user is logged in, /login should redirect to /urls.
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  //if the user is logged in, redirect to /urls
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("register");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect('/urls');
    }
    return res.status(403).send("Error: incorrect password");
  }

  return res.status(403).send("Error: no user found with those credentials");
  //redirect the client back to the url
});

//post route for user regristration
app.post("/register", (req, res) => {
  //get email and password & generate a random ID for our new User
  const { email: email, password: password } = req.body;
  let newUserId = generateRandomString();

  // Check for empty email or password
  if (!email || !password) {
    return res.status(400).send("Error: no email or password provided");
  }

  // Check if the email already exists
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Error: user already exists");
  }

  //Hash password before saving it
  const hashedPassword = (bcrypt.hashSync(password, 10));

  //Add the newUser and their id to our users object.
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: hashedPassword
  };
  //add cookie for user id
  req.session.user_id = newUserId;
  res.redirect("/urls");
  //redirect to /urls
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  //If a user is not logged in, send them to the login page.
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  const user = users[req.session.user_id];

  //Send 400 bad request error if user is not logged in.
  if (!req.session.user_id) {
    res.status(400).send("Error: please login to view your URLs");
  }
  //Send 404 error if url is not found.
  if (!url) {
    res.status(404).send("Error: URL not found");
  }
  //Send 403 error if user does not own url.
  if (url.userID !== user.id) {
    res.status(403).send("Error: you are trying to access URLs not belonging to this user");
  }

  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: url
  };
  res.render("urls_show", templateVars);
});

//Route handler to handle shortURL requests
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  //Check if url exists in the urlDatabase
  if (longURL) {
    res.redirect(longURL);
  }
  //Send error message if not found.
  res.status(404).send("Error: URL not found");
});

//Route handler for POST requests to /url
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const id = generateRandomString();
  const longURL = req.body.longURL;

  //Store in the urlDatabase
  urlDatabase[id] = {
    longURL: longURL,
    userID: user
  };
  //Redirect users to /urls/:id.
  res.redirect(`/urls/${id}`);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const urls = getUrlsForUser(req.session.user_id);

  //Redirect user to login before they can see their urls.
  if (!user) {
    res.redirect("/login");
  }
  //If user is logged in, display urls. Use getUrlsForUser
  const templateVars = { urls: urls, user: user };
  res.render("urls_index", templateVars);
});

//Add a post route that removes url resource.
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  // Check if the url id exists.
  if (!urlDatabase[id]) {
    return res.status(404).send("Error: URL not found");
  }

  // Check if the user is logged in
  if (!req.session.user_id) {
    return res.status(401).send("Error: You must be logged in to edit URLs");
  }

  // Check if the user owns the url
  if (urlDatabase[id].userID !== req.session.user_id) {
    return res.status(403).send("Error: You do not own this URL");
  }
  delete urlDatabase[id];
  //redirect client to /urls
  res.redirect('/urls');
});

//get route to get the edit form for a specific url
app.get("/urls/:id/edit", (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  res.render("edit_form", { id: id, longURL: longURL, user: user });
});

//new post route to update the value of the stored long URL based on the new value in req.body.Url
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  // Check if the url id exists
  if (!urlDatabase[id]) {
    return res.status(404).send("Error: URL not found");
  }

  // Check if the user is logged in
  if (!req.session.user_id) {
    return res.status(401).send("Error: You must be logged in to edit URLs");
  }

  // Check if the user owns the url
  if (urlDatabase[id].userID !== req.session.user_id) {
    return res.status(403).send("Error: You do not own this URL");
  }

  //Save Url to database.
  urlDatabase[id].longURL = newLongURL;
  //redirect the client back to urls
  res.redirect('/urls');
});

app.get("/urls/index", (req, res) => {
  const user = users[req.session.user_id];
  const email = user.email;
  const templateVars = {
    user: user,
    email: email
  };
  res.render("urls_index", templateVars);
});

//implement route to logout
app.post("/logout", (req, res) => {
  //clear cookies
  req.session.user_id = null;
  //redirect to /urls
  res.redirect("/login");
});

//Export urlDatabase for use in helpers.js.
module.exports = urlDatabase; 