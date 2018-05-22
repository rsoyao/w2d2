const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

//middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  secret: "Blue-dinosausrs"
}));

//hardcoded database
var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomId"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID"
  }
};

const users = {

};

// random user ID
function generateRandomString() {
  let randomString = "";
  let newString = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (var i = 0; i < 5; i++) {
    var random = Math.floor(Math.random() * newString.length - 1);
    randomString += newString[random];
  }
  return randomString;
}

// add user ID to DB
function urlsForUser(id) {
  var userURL = {};
  for (key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
}

//---- GET ----

// List all urls in user database
app.get("/urls", (req, res) => {
  if (req.session) {
    var templateVars = {
      urls: urlsForUser(req.session.id),
      user: users[req.session.id],
    };
    console.log(req.session.id, "this!!");
    console.log(templateVars);
    res.render("urls_index", templateVars);
  } else {

  }
});

// New url
app.get("/urls/new", (req, res) => {
  if (users[req.session.id]) {
    let templateVars = {
      user: users[req.session.id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/register");
  }
});

// Registration
app.get('/register', (req, res) => {
  res.render('urls_register');
});

// Display the shortURL and longURL
app.get("/urls/:id", (req, res) => {
  if (req.session && req.session.id && urlDatabase[req.params.id].userId === req.session.id) {
    let templateVars = {
      shortURL: req.params.id,
      urls: urlDatabase,
      user: users[req.session.id]
    };
    res.render("urls_show", templateVars);
  } else if (req.session.id) {
    res.status(403).send("Sorry, you do not have permissions to change this URL");
  } else {
    res.status(403).send("Please Login First!");
  }
});

// Redirect to longURL original website
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(req.params);
  res.redirect(longURL);
});

// Login page
app.get('/login', (req, res) => {
  res.render('urls_login');
});


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//---POST HANDLERS---

// Create a new short url
app.post('/urls', (req, res) => {
  if (req.session.id) {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userId: req.session.id
    };
  }
  res.redirect('/urls');
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Handle longURL redirection
app.post("/urls/:id", (req, res) => {
  var longURL = req.body.longURL;
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userId: req.session.id

  };
  res.redirect("/urls");
});

// Handle Login
app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (userName === "" || password === "") {
    return res.status(404).send("Please enter valid credentials");
  }

  for (var id in users) {
    console.log(users[id].email, bcrypt.compareSync(password, hashedPassword));
    if (userName === users[id].email && bcrypt.compareSync(password, hashedPassword)) {
      req.session.id = id;
      console.log(req.session.user_id);
      return res.redirect("/urls");
    }
  }

  return res.status(403).send("403 Forbidden Error");

});

//Handle Registration
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.password.length > 0 && newEmail.length > 0 && newPassword.length > 0) {
    for (key in users) {
      if (users[key].email === newEmail) {
        return res.status(400).send('THIS EMAIL IS CURRENTLY REGISTERED!');
      }
    }
    let newId = generateRandomString();

    users[newId] = {
      id: newId,
      email: newEmail,
      password: newPassword
    };
    req.session.id = newId;
    console.log(users);
    return res.redirect('/urls');
  } else {
    res.status(400).send('YOU MISSED A STEP!');
  }

});

//Handle logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// FIre up the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});