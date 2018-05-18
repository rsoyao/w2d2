var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "ramiscool",
    email: "ram@is.cool",
    password: "ramiscool"
  }
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Index - URL List
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

// Register Page
// app.post("/urls", (req, res) => {
//   let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
//   res.render("urls_register");
// })

//Register Link
app.get("/register", (req, res) => {
   let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});

// Registration Handler (Creates a new user_id)
app.post("/register", (req, res) => {
const newEmail = req.body.email;
const newPass = req.body.password;
let cookie = req.cookies["user-id"]
const randomID = generateRandomString();
if (newEmail === "" || newPass === "") {
  res.status(400).send("Cmon man, put something in!")
} else {
  for (var i in users){
    if (newEmail === users[i].email) {
      res.status(400).send("Error! Identity theft is not a joke!")
    }
  }
}
newID = {
  id: randomID ,
  email: newEmail ,
  password: newPass
}
  res.cookie("user_id", cookie);
  res.redirect("/urls")
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
app.post("/urls/:id", (req, res) => {
 let shortURL= req.params.id;
 let longURL = req.body.longURL;
 urlDatabase[shortURL] = longURL;
 res.redirect('/urls')

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

app.get("/login", (req, res) => {
   let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"]};
  res.render("urls_login", templateVars);
});

// Cookies - LOGIN with username
app.post("/login", (req, res) => {
  let username = req.body.username
  let password = req.body.password
  console.log(req.body.username)
  if (username)
  for (name in users) {
    if (username === users[name].email) {
      if(bcrypt.compareSync(password, users[name].password) ) {
        req.session.id = users[name].id
          res.redirect('/urls')
          return;
      } else {
        res.status(403).send ('Oops! Looks like you entered the wrong password!')
      return;
      }
    }
  }
  res.status(403).send('Are you sure you entered in your username and password correctly?')
  res.cookie("user_id", user_id)
  res.redirect("/urls");
});


//LOGOUT
app.post("/logout", (req, res) => {
  // const userN = req.body.username
  res.clearCookie("user_id")
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
  user_id: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id],
   user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});