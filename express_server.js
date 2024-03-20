const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
//middleware to parse
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
//middleware for errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  //send status code telling us to get Bob the Builder on it!
  res.status(500).send("WARNING\nsomething's broken");
});

const generateRandomString = function() {
  //variable to store randomly generated string
  let newStr = '';
  //store alphabet + numbers 1-9 to loop over/use method
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz123456789';
  //loop over alphaNum 6 times to generate 6 different letters/nums
  for (let i = 0; i < 6; i++) {
    const randomStr = (Math.floor(Math.random() * alphaNum.length));
    newStr += alphaNum[randomStr];
  }
  //OUTPUT: a string of 6 random alpha-numeric charachters
  return newStr;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

//route handler for POST requests to /url
app.post("/urls", (req, res) => {    
    //get id-longURL key + values
   try {
    const id = generateRandomString();
    const longURL = req.body.longURL;

    //store the key + value in the urlDatabase
    urlDatabase[id] = longURL;
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
    const longURL = urlDatabase[req.params.id];
    //redirect to its longURL
    res.redirect(longURL);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server error');
  }
});

//adding a post route that removes url resource: '/urls/:id/delete'
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  //redirect client to /urls
  res.redirect('/urls');
});

//get route to get the edit form for a specific url
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id
  const longUrl = urlDatabase[id]

  res.render("edit_form", {id: id, longUrl: longUrl})
})

//new post route to update the value of the stored long URL based on the new value in req.body.Url
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id
  const newLongUrl = req.body.Url
 
  urlDatabase[id] = newLongUrl
  //redirect the client back to urls
  res.redirect('/urls')
})


//post route for /login to express_server.js
app.post("/login", (req, res) => {
  const { username } = req.body;

  res.cookie("username", username);
  //redirect the client back to the url
  res.redirect('/urls');
})

app.get("/urls/index", (req, res) => {
  console.log("Username from cookies:", req.cookies["username"]);
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//implement route to logout
app.post("/logout", (req, res) => {
  //clear cookies
  res.clearCookie("username")
  //redirect to /urls
  res.redirect("/urls")
})




