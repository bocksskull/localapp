// configuring the strategies for passport

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../app/models/user');

module.exports = function(passport){

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // Local Signup
    passport.use('local-signup', new LocalStrategy({
    	// by default, local strategy uses username and password, we will override with email
    	usernameField: 'email',
    	passwordField: 'password',
    	passReqToCallback: true // allows us to pass back the entire request to callback
    }, function(req, email, password, done){

    	// asynchronous
    	// User.findOne wont fire unless data is sent back
    	process.nextTick(function(){

    		// find a user whose email is same as the forms email
    		// we are checking to see if the user trying to register already exits
    		User.findOne({'email': email}, function(err, user){
    			// if any error, return error
    			if(err)
    				return done(err);

    			// check to see if user already exists
    			if(user){
    				return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    			}else{

    				// if there is no user with that email
    				// create the user
    				var newUser = new User();

    				// set user's local credentials
    				newUser.email = email;
    				newUser.password = newUser.generateHash(password);
                    newUser.account_type = "admin";

    				// save the user
    				newUser.save(function(err){
    					if(err)
    						throw err;

    					return done(null, newUser);
    				});

    			}

    		});

    	});

    }));

	
	// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // overriding default username field
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done){
        // check if passed is email or username
        if(email.indexOf('@') != -1){
            // means passed is email
            User.findOne({'email': email}, function(err, user){
                if(err)
                    return done(err);

                if(!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if(!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                var forFront = {
                    id: user._id,
                    account_type: user.account_type,
                    email: user.email,
                    ppic: user.profile_pic
                };

                req.session.user = forFront;
                // all is well, return successful user
                return done(null, forFront);
            });
        }
    }));

};