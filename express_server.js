const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
//middleware to parse
app.use(express.urlencoded({ extended: true }));

const generateRandomString = function() {
//variable to store randomly generated string
  let newStr = '';
  //store alphabet + numbers 1-9 to loop over/use method
  const alphaNum = 'abcdefghijklmnopqrstuvwxyz123456789'
  //loop over alphaNum 6 times to generate 6 different letters/nums
  for (let i = 0; i < 6; i++) {
  const randomStr = (Math.floor(Math.random() * alphaNum.length))
  newStr += alphaNum[randomStr]
  }
//OUTPUT: a string of 6 random alpha-numeric charachters
  return newStr;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
	res.send("Hello!")
})

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//route handler for POST requests to /url
app.post("/urls", (req, res) => {
  //get id-longURL key + values
  const id = generateRandomString()
  const longURL = req.body.longURL;

  //store the key + value in the urlDatabase
  urlDatabase[id] = longURL;
//redirect users to /urls/:id
  res.redirect('/urls/${:id}')
})

//Route handler to handle shortURL requests
app.get("/u/:id", (req, res) => {
  //request end point "/u/:id"
  const longURL = urlDatabase[req.params.id]
  //redirect to its longURL
  res.redirect(longURL);
});

