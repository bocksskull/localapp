// all the routes for our application

module.exports = function(app, passport, restcalls){

    app.use(function (req, res, next) {
        res.locals.login = req.isAuthenticated();
        next();
    });

    app.get('/api/v1/testlink', restcalls.testLink);

	// login
	app.post('/api/v1/login', restcalls.loginUser);

    // register
	app.post('/api/v1/signup', restcalls.registerUser);


    // Logout
    app.get('/api/v1/logout', function(req, res) {
        req.logout();
        // res.redirect('/');
    });

    // get neighborhood list
    app.get('/api/v1/neighborhoods', restcalls.getAllNeighborhoods);

    // get single neighborhood
    app.get('/api/v1/neighborhoods/neighborhood/:id', restcalls.getSingleNeighborhood);

    // get single park
    app.get('/api/v1/getparks/getpark/:id', restcalls.getSinglePark);

    // get parks listing for a neighborhood
    app.get('/api/v1/getparks/:nid', restcalls.getParksListNeighbor);

    // get parks listing for a zipcode
    app.get('/api/v1/getzparks/:zip', restcalls.getParksListZip);

    // get parks near user location
    app.post('/api/v1/getparksnearuser', restcalls.getParksNearUser);

    // to create new neighborhood
    app.post('/api/v1/createneighborhood', restcalls.createNewNeighborhood);

    // to edit neighborhood
    app.post('/api/v1/editneighborhood', restcalls.editNeighborhood);

    // to create new park
    app.post('/api/v1/createpark', restcalls.createNewPark);

    // to edit park
    app.post('/api/v1/editpark', restcalls.updateExistingPark);

    // return parks group by zipcode
    app.get('/api/v1/groupzipparks', restcalls.getParksByZip);

    // search park text and with params
    app.get('/api/v1/searchparks', restcalls.searchParks);

    // like a park
    app.get('/api/v1/likepark/:id', restcalls.likePark);

    // unlike a park
    app.get('/api/v1/dislikepark/:id', restcalls.dislikePark);

    // get favorite parks
    app.post('/api/v1/getmultipleparks', restcalls.getMultipleParks);

    // Normal website pages ==================

    app.get(['/', '/index'], function(req, res){
        res.render('index', {
            req: req
        });
    });

    // login page
    app.get('/login', protectedView, function(req, res){
        res.render('accounts/login', {message: req.flash('loginMessage')});
    });

    // process login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true // allow flash messages
    }));

    // signup page
    app.get('/signup', protectedView, function(req, res){
        res.render('accounts/signup', {message: req.flash('signupMessage')});
    });

    // process signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    /*// user home page
    app.get('/home', isLoggedIn, function(req, res){
        res.render('home', {
            user: req.user
        });
        // res.locals.login = req.isAuthenticated();
    });*/

    // logout user
    app.get('/logout', function(req, res){
        req.logout();
        // req.session.user.destory();
        delete req.session.user;
        res.redirect('/');
    });

    // neighborhoods
    app.get('/neighborhoods', function(req, res){
        restcalls.getFrontEndNeighborhoods(function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('neighbor', {
                    data: []
                })
            }else{
                res.render('neighbor', {
                    data: result
                });
            }
        })
    });

    app.get('/parks', function(req, res){
        restcalls.getAllParks(function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('parks', {
                    data: []
                })
            }else{
                res.render('parks', {
                    data: result
                });
            }
        })
    });

    // show single neighborhood
    app.get('/neighborhoods/neighborhood/:id', function(req, res){
        restcalls.getFrontSingleNeighbor(req.params.id, function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('sneighbor', {
                    data: []
                })
            }else{
                res.render('sneighbor', {
                    data: result
                });
            }
        })
    })

    // show single park
    app.get('/parks/park/:id', function(req, res){
        restcalls.getFrontSinglePark(req.params.id, function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('spark', {
                    data: []
                })
            }else{
                res.render('spark', {
                    data: result
                });
            }
        })
    });

    // add/edit neighborhood routes
    app.get('/neighborhoods/add', function(req, res){
        res.render('nadd');
    });

    app.get('/neighborhoods/neighborhood/edit/:id', function(req, res){
        restcalls.getFrontSingleNeighbor(req.params.id, function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('nedit', {
                    data: []
                })
            }else{
                res.render('nedit', {
                    data: result
                });
            }
        })
    });


    // add/edit park routes
    app.get('/parks/add', function(req, res){
        res.render('parkadd');
    });

    app.get('/parks/park/edit/:id', function(req, res){
        restcalls.getFrontSinglePark(req.params.id, function(err, result){
            if(err){
                console.log('error: ' + err);
            }

            if(result.length == 0){
                res.render('parkedit', {
                    data: []
                })
            }else{
                res.render('parkedit', {
                    data: result
                });
            }
        })
    });

    app.get('*', function(req, res){
        res.render('404');
    });

};

// route middleware to make sure a user is logged in to access some pages
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the index page
    res.redirect('/login');
}

// this is so that a logged in user not visit say login or register page
function protectedView(req, res, next){

    // is user is logged in
    if(req.isAuthenticated())
        res.redirect(req.session.backURL || '/');

    // if not
    return next();
}