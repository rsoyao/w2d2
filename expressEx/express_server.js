var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);


function generateRandomString() {
  var input = '';
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (var i = 0; i < 6; i++)
    input += possible.charAt(Math.floor(Math.random() * possible.length)); // pushing the numbers into the emptt array
  return input;
}

const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "userRandomID"
  },
  "3rf9Df": {
    url: "http://facebook.com",
    userID: "userRandomID"
  }
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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  keys: ["dogsandcars"],
}))

// Index - URL List
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user_id: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Register Page
// app.post("/urls", (req, res) => {
//   let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
//   res.render("urls_register");
// })

//Register Link
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user_id: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

// Registration Handler (Creates a new user_id)
// app.post("/register", (req, res) => {
//   const newEmail = req.body.email;
//   const newPass = req.body.password;
//   let cookie = req.session["user-id"]
//   const randomID = generateRandomString();
//   if (newEmail === "" || newPass === "") {
//     res.status(404).send("Cmon man, put something in!")
//   } else {
//     for (var i in users) {
//       if (newEmail === users[i].email) {
//         res.status(404).send("Error! Identity theft is not a joke!")
//       }
//     }
//   }
//   newID = {
//     id: randomID,
//     email: newEmail,
//     password: newPass
//   }
//   req.session("user_id", cookie); // changed from res.cookie
//   res.redirect("/urls")
// });

app.post("/register", (req, res) => {
  const newUser = req.body.email;
  const newPass = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPass, 10);

  var autogenID = generateRandomString();
  console.log(autogenID);


  if (newUser === "" || newPass == "") {
    res.status(404).send("Your request failed! Please enter a value for username and password");
    return;
  }
  for (var id in users) {
    if (newUser === users[id].email) {
      res.status(404).send("Your request failed! becase it's a duplicate");
      return;
    }
  }
  users[autogenID] = {
    id: autogenID,
    email: newUser,
    password: hashedPassword
  };

  req.session.user_id = "user_id", autogenID;
  // res.cookie("user_id", autogenID);
  res.redirect("/urls");
  // console.log(userDatabase);
  return;
});

// Create a Post
app.post("/urls", (req, res) => {
  var a = req.body.longURL;
  var b = generateRandomString();
  urlDatabase[b] = a;
  console.log(urlDatabase); // debug statement to see POST parameters
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
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls')

});

// Delete a post
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const long = urlDatabase[id];
  if (users)
    if (long) {
      delete urlDatabase[id];
    }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user_id: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

// Cookies - LOGIN with username
// app.post("/login", (req, res) => {
//   let username = req.body.email
//   let password = req.body.password
//   console.log(req.body.username)
//   console.log(req.body.password)
//   if (username)
//     for (name in users) {
//       if (username === users[name].email) {
//         if (bcrypt.compareSync(password, users[name].password)) {
//           req.session.id = users[name].id
//           res.redirect('/urls')
//           return;
//         } else {
//           res.status(403).send('Oops! Looks like you entered the wrong password!')
//           return;
//         }
//       }
//     }
//   res.status(403).send('Are you sure you entered in your username and password correctly?')
//   req.session("user_id", user_id); //changed from res.cookie
//   res.redirect("/urls");
// });

app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (userName === "" || password === "") {
    return res.status(404).send("Please enter valid credentials");
  }

  for (var id in users) {
    if (userName === users[id].email && bcrypt.compareSync(password, hashedPassword)) {
            req.session.user_id = id;
      return res.redirect("/urls");
    }
  }

  return res.status(403).send("403 Forbidden Error");

});

//LOGOUT
app.post("/logout", (req, res) => {
  // const userN = req.body.username
  req.session = null; // clear session?
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.id]) {
    let templateVars = {

      user_id: req.session["user_id"]
      // res.render("urls_new", templateVars);
    }
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    "user_id": req.session.user_id
  };
  user_id = req.session["user_id"]
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});