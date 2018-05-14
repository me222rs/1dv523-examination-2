/*jshint esversion: 6 */
const express       = require("express");
const hbs           = require("express-handlebars");
const bodyParser    = require("body-parser");
const path          = require("path");
const session       = require("express-session");
const csrf         = require("csurf");
const helmet = require('helmet');


const app  = express();
const port = process.env.PORT || 8000;

app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '/public')));

app.use(session({
    name:   "snippetwebsite",
    secret: "derpdurp",
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60*60*24*1000 //24h
    }
}));

app.use(csrf());

app.use(function(req, res, next){
  res.locals.csrfToken = req.csrfToken();
  next();
});

//CSRF error handling
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN'){
    return next(err);
  }
  res.status(403).render("403", {message: "You are not allowed to do that!", link: "/login", linkName:"Log in"});
});

app.use(function(req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;

    next();
});

app.use("/", require("./routes/home.js"));
app.use("/", require("./routes/register.js"));
app.use("/", require("./routes/snippet.js"));
app.use("/", require("./routes/login.js"));

app.use((req, res) => {
    res.status(404).render("404");
});

app.use((req, res) => {
    res.status(500).render("500");
});

app.listen(port, () => console.log(`App running on ${port}`));
