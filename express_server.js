const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers')
const { generateRandomString } = require('./helpers')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//Middleware to parse.
app.use(express.urlencoded({ extended: true }));

//Middleware for testing with chai-http.
app.use(express.urlencoded({extended:false}));
// add this line
app.use(express.json());

//middleware for cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

//Middleware for error handling.
app.use((err, req, res, next) => {
  console.error(err.stack);
  //Send status code telling us to get Bob the Builder on it!
  res.status(500).send("");
});

//return the urls pertaining to the specific user
const urlsForUser = function(id) {
  const urlsById = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlsById[key] = urlDatabase[key];
    }
  }
  return urlsById;
};

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
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
  const user = users[req.session.user_id];
  const url = urlDatabase[req.params.id];

  //Send 400 bad request error if user is not logged in.
  if (req.session.user_id) {
    res.send(400).send("Error: please login to view your URLs");
  }
  //Send 404 error if url is not found.
  if (!url) {
    res.status(404).send("Error: URL not found")
  }
  //Send 400 error if user does not own url.
  if (url.userID !== user.id) {
    res.status(400).send("Error: you are trying to access URLs not belonging to this user");
  }
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];

  //Redirect user to login before they can see their urls.
  if (!user) {
    res.redirect("/login")
  }
  //If user is logged in, display urls
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

//route handler for POST requests to /url
app.post("/urls", (req, res) => {
  //get id-longURL key + values
  try {
    const id = generateRandomString();
    const longURL = req.body.longURL;

    //store the key + value in the urlDatabase
    urlDatabase[id].longURL = longURL;
    //redirect users to /urls/:id
    res.redirect(`/urls/${id}`);
  }
  catch (error) {
    console.log(error.message);
    res.status(500).send('Server error');
  }
});

//Route handler to handle shortURL requests
app.get("/u/:id", (req, res) => {
  try {
    //request end point "/u/:id"
    const longURL = urlDatabase[req.params.id].longURL;
    if (!longURL) {
      res.status(404).send("Error: URL not found");
      return;
    }
    //redirect to its longURL
    res.redirect(longURL);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error');
  }
});

//Add a post route that removes url resource.
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];

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
  //redirect client to /urls
  res.redirect('/urls');
});

//get route to get the edit form for a specific url
app.get("/urls/:id/edit", (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const longUrl = urlDatabase[id].longURL;

  res.render("edit_form", { id: id, longUrl: longUrl, user: user });
});

//new post route to update the value of the stored long URL based on the new value in req.body.Url
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newLongUrl = req.body.longURL;

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
  urlDatabase[id].longURL = newLongUrl;
  //redirect the client back to urls
  res.redirect('/urls');
});

app.get("/urls/index", (req, res) => {
  const user = users[req.session.user_id];
  const email = users[email];
  const templateVars = {
    user: user,
    email: email
  };
  res.render("urls_index", templateVars);
});

//add route for form in register.ejs
app.get("/login", (req, res) => {
  //If the user is logged in, GET /login should redirect to GET /urls.
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("login");
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

//implement route to logout
app.post("/logout", (req, res) => {
  //clear cookies
  req.session.user_id = null;
  //redirect to /urls
  res.redirect("/login");
});

//get route for user registration
app.get("/register", (req, res) => {
  //if the user is logged in, redirect to /urls
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("register");
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