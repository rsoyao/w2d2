var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString() {
  var input = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (var i = 0; i < 6; i++)
    input += possible.charAt(Math.floor(Math.random() * possible.length));
  return input;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "3rf9Df": "http://facebook.com"
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// Index - URL List
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create a Post
app.post("/urls", (req, res) => {
  var a = req.body.longURL;
  var b = generateRandomString();
  urlDatabase[b] = a;
  console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect("/urls/" + b)
});

//Edit  a post
// app.get("urls/:id/edit", (req, res) => {
//   const id = req.params.id;
//   const long = urlDatabase[id];

//   if (long) {
//     res.render("urls_show", { id: id, long: long});
//     res.redirect(`/urls/${id}`);
//   } else {
//     res.redirect("/urls");
//   }
// });

//Update
app.post("urls/:short", (req, res) => {
 // let longURL = req.body.longURL
 // urlDatabase[req.params.id] = longURL
 let short = req.params.short;
 let long = urlDatabase[short];
 urlDatabase[short] = req.body.input;
 if (long) {
  res.redirect('/urls')
 }
});

// Delete a post
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const long = urlDatabase[id];

  if (long) {
    delete urlDatabase[id];
  }

  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});
