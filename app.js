require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;


mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost/celebrity', {
    useNewUrlParser: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


// app.use(session({
//   secret: "Secret-Key",
//   cookie: { maxAge: 60000 },
//   store: new MongoStore({
//     mongooseConnection: mongoose.connection,
//     ttl: 24 * 60 * 60 // 1 day
//   })
// }));

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
// this line is basically turning passport on

app.use(passport.session());
// this line connects the passport instance you just created, with the session that you just created above it


app.use(flash());


passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});


passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({
    username
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, {
        message: "Incorrect username"
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, {
        message: "Incorrect password"
      });
    }

    return next(null, user);
  });
}));



//creates universal variable in all hbs files
//creates user in session 
app.use((req, res, next) => {

  res.locals.theUser = req.user;

  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');

  next();

})


passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "/user/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // to see the structure of the data in received response:
      console.log("Google account details:", profile);

      User.findOne({
          googleID: profile.id
        })
        .then(user => {
          if (user) {
            done(null, user);
            return;
          }

          if (profile.photos) {
            theImage = profile.photos[0].value;
          }

          User.create({
              googleID: profile.id,
              isAdmin: false,
              image: theImage,
              profile: profile._json.username
            })
            .then(newUser => {
              done(null, newUser);
            })
            .catch(err => done(err)); // closes User.create()
        })
        .catch(err => done(err)); // closes User.findOne()
    }
  )
);



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

const index = require('./routes/index');
app.use('/', index);

const celebRoutes = require('./routes/celeb-routes');
app.use('/celebrity', celebRoutes);

const movieRoutes = require('./routes/movie-routes');
app.use('/movies', movieRoutes);

const userRoutes = require('./routes/user-routes');
app.use('/user', userRoutes);

const adminRoutes = require('./routes/admin-routes');
app.use('/admin', adminRoutes);

module.exports = app;