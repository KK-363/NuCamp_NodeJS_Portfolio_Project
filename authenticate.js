const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// takes in user object and creates token
exports.getToken = user => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

// configure JWT Strategy for passport
const opts = {};
// specifies how jwt should be extracted from incoming request message
// send as an AuthHeader as a BearerToken
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// sets key to use for signed token
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    // instance of JWTStrategy
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

// used to verify an incoming request is from an authenticated user, using jwt strategy and say we are not using sessions
// setup here as a shortcut to use in other modules when we want to use the jwt strategy
exports.verifyUser = passport.authenticate('jwt', {session: false});

// checks if user is an admin
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin){
        return next();
    }
    else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

// checks if user is a teacher
exports.verifyTeacher = (req, res, next) => {
    if (req.user.role === 'teacher'){
        return next();
    }
    else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

// checks if user is a student
exports.verifyStudent = (req, res, next) => {
    if (req.user.role === 'student'){
        return next();
    }
    else {
        const err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}