// contains rest api calls for the project
// user portion of the site

// load up the user model
var Neighborhood = require('../app/models/neighborhood');
var Park = require('../app/models/park');
var User = require('../app/models/user');

var async = require('async');

exports.testLink = function(req, res){
	var coords = [-73.9654,40.7829];

	var METERS_PER_MILE = 1609.34;

	var q = Park.find({
		"location": {
			$nearSphere: {
				$geometry: {
					type: 'Point',
					coordinates: coords
				},
				$maxDistance: 10 * METERS_PER_MILE // distance is 10 miles for now
			}
		}
	}, '-_id -__v');

	q.exec(function(err, docs){
		if(err){
			res.json({status: "error", data: "Some error occurred: " + err});
			return;
		}

		res.json({status: "success", data: docs});
	})

};

// this gets parks from their id's
exports.getMultipleParks = function(req, res){
	var ids = req.body.ids;
	ids = JSON.parse(ids);

	Park.find({'id': {'$in': ids}}, '-__v', function(err, docs){

		if(err){
			res.json({status: "error", data: err});
			return;
		}

		res.json({status: "success", data: docs});

	});

};

exports.dislikePark = function(req, res){
	Park.findOneAndUpdate({'id': req.params.id}, {'$inc': {totalLikes: -1}}, function(err, docs){
		if(err){
			res.json({status: 'error', data: err});
			return;
		}

		res.json({status: "success", data: "Park disliked."});
	});
};

// like a park
exports.likePark = function(req, res){
	Park.findOneAndUpdate({'id': req.params.id}, {'$inc': {totalLikes: 1}}, function(err, docs){
		if(err){
			res.json({status: 'error', data: err});
			return;
		}

		res.json({status: "success", data: "Park liked."});
	});
};

// search functionality
exports.searchParks = function(req, res){
	// we can get term, amenities or both

	var term = req.query['term'];
	var am = req.query['amenities'];

	if(am != undefined){
		am = am.split(',');
	}

	if(term != undefined && am == undefined){

		// find by term only
		var regex = new RegExp(term, 'i');
		Park.find({'title': regex}, '-_id -__v', function(err, docs){
			if(err){
				res.json({status: 'error', data: err})
				return;
			}

			res.json({status: 'success', data: docs});
		});

	}else if(term == undefined && am != undefined){

		// find by amenities only
		Park.find({'amenities': {'$in': am}}, '-_id -__v', function(err, docs){
			if(err){
				res.json({status: 'error', data: err})
				return;
			}

			res.json({status: 'success', data: docs});
		});

	}else{

		// find by both
		var regex = new RegExp(term, 'i');
		Park.find({
			'$or': [
				{'title': regex},
				{'amenities': {'$in': am}}
			]
		}, '-_id -__v', function(err, docs){
			if(err){
				res.json({status: 'error', data: err})
				return;
			}

			res.json({status: 'success', data: docs});
		});

	}

};

// return parks grouped by zipcode
exports.getParksByZip = function(req, res){

	Park.aggregate(
		{"$group": {_id: "$zipCode", imgUrl: {$first: "$imgUrl"}, count: {'$sum': 1}}}
	).sort({count:-1}).exec(function(err, docs){
		if(err){
			res.json({status: 'error', data: err})
			return;
		}

		res.json({status: 'success', data: docs});
	});

};

// edit/update park
exports.updateExistingPark = function(req, res){

	var coords = [];
	coords[0] = req.body.longitude;
	coords[1] = req.body.latitude;

	var now = new Date();

	Park.findOneAndUpdate({'id': req.body.id}, {
		'$set': {
			'title': req.body.title,
			'desc': req.body.desc,
			'street': req.body.street,
			'city': req.body.city,
			'country': req.body.country,
			'zip': req.body.zip,
			'amenities': req.body.amenities,
			'nid': req.body.nid,
			'location.coordinates': coords,
			'last_updated': now,
			'imgUrl': req.body.imgurl
		}
	}, {new:true}, function(err, doc){
		if(err){
			res.json({status: 'error', data: err})
			return;
		}

		res.json({status: 'success', data: doc});
	})

};

// create new park
// also increase count in neighborhoods
exports.createNewPark = function(req, res){
	
	async.parallel([
		
		function(callback){

			var park = new Park();

			park.title = req.body.title;
			park.imgUrl = req.body.imgurl;
			park.description = req.body.desc;
			park.streetAddress = req.body.street;
			park.city = req.body.city;
			park.country = req.body.country;
			park.zipCode = req.body.zip;
			park.amenities = req.body.amenities;
			park.neighborhood_id = req.body.nid;

			var coords = [];
			coords[0] = req.body.longitude;
			coords[1] = req.body.latitude;

			park.location.coordinates = coords;

			park.save(function(err, doc){
				if(err)
					callback(err);
				
				callback(null, doc);
			});

		},

		function(callback){

			Neighborhood.findOneAndUpdate({'id': req.body.nid}, {'$inc': {totalParks: 1}}, function(err, doc){
				if(err)
					callback(err);

				callback(null, 'done');
			});

		}

	], function(err, result){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		
		res.json({status: "success", data: result});
	});

};

// edit neighborhood
exports.editNeighborhood = function(req, res){
	var now = new Date();
	console.log(now);
	Neighborhood.findOneAndUpdate({'id': req.body.id}, {'$set': {'title': req.body.title, 'last_updated': now, 'imgUrl': req.body.imgurl}}, {new:true}, function(err, doc){
		if(err){
			res.json({status: 'error', data: err});
			return;
		}
		res.json({status: 'success', data: doc});
	})
};

// create new neighborhood
exports.createNewNeighborhood = function(req, res){
	var ne = new Neighborhood();

	ne.title = req.body.title;
	ne.imgUrl = req.body.imgurl;

	ne.save(function(err, doc){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: 'success', data: doc});
	});
};

/* get parks list
 can happen for a neighborhood or based on a location (lets split it)
*/

exports.getParksNearUser = function(req, res){
	var coords = []; // [<longitude>, <latitude>]
	coords[0] = req.body.longitude;
	coords[1] = req.body.latitude;
	console.log(coords);

	var METERS_PER_MILE = 1609.34;

	var q = Park.find({
		"location": {
			$nearSphere: {
				$geometry: {
					type: 'Point',
					coordinates: coords
				},
				$maxDistance: 10 * METERS_PER_MILE // distance is 10 miles for now
			}
		}
	}, '-_id -__v');

	q.exec(function(err, docs){
		if(err){
			res.json({status: "error", data: "Some error occurred: " + err});
			return;
		}

		res.json({status: "success", data: docs});
	})
};

exports.getParksListNeighbor = function(req, res){
	Park.find({neighborhood_id: req.params.nid}, '-_id -__v', function(err, docs){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: "success", data: docs});
	});
};

exports.getParksListZip = function(req, res){
	Park.find({zipCode: req.params.zip}, '-_id -__v', function(err, docs){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: "success", data: docs});
	});
};

// get all parks for frontend
exports.getAllParks = function(callback){
	Park.find({}, '-_id -__v', function(err, docs){
		if(err){
			callback(err);
			return;
		}
		callback(null, docs);
		return;
	});
};

// get single park for website
exports.getFrontSinglePark = function(id, cb){
	Park.find({'id': id}, function(err, result){
		if(err){
			cb(err);
			return;
		}
		cb(null, result);
		return;
	})
};

// get single park, pass in id
exports.getSinglePark = function(req, res){
	Park.find({id: req.params.id}, '-_id -__v', function(err, docs){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: "success", data: docs});
	});
};

// get single neighborhood, pass in id, for api
exports.getSingleNeighborhood = function(req, res){
	Neighborhood.find({id: req.params.id}, function(err, docs){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: "success", data: docs});
	});
};

// get single neighborhood, for website
// also return parks
exports.getFrontSingleNeighbor = function(id, cb){

	async.parallel([

		function(callback){
			Neighborhood.find({'id': id}, function(err, docs){
				if(err)
					callback(err);
				
				callback(null, docs);
			})
		},

		function(callback){
			Park.find({'neighborhood_id': id}, function(err, docs){
				if(err)
					callback(err);

				callback(null, docs);
			})
		}

	], function(err, result){
		if(err){
			cb(err);
			return;
		}
		cb(null, result);
		return;
	});

};

// get all neighborhoods for api
exports.getAllNeighborhoods = function(req, res){
	Neighborhood.find({}, function(err, docs){
		if(err){
			res.json({status: "error", data: err});
			return;
		}
		res.json({status: "success", data: docs});
	});
};

// get all neighborhoods for website
exports.getFrontEndNeighborhoods = function(callback){
	Neighborhood.find({}, function(err, docs){
		if(err){
			callback(err);
			return;
		}
		callback(null, docs);
		return;
	});
};


// normal login of user
// login can be done by either username/password combination
// or email/password combination
exports.loginUser = function(req, res){

	if(req.body.euser.indexOf('@') != -1){
		// means email/password combination
		User.findOne({"email": req.body.euser}, function(err, user){
			if(err){
				res.json({status: "error", data: "Some error occurred. Try again later"});
				return;
			}

			if(!user){
				res.json({status: "error", data: "No user found."});
				return;
			}

			if(!user.validPassword(req.body.password)){
				res.json({status: "error", data: "Invalid password."});
				return;
			}

			res.json({status: "success", data: user});

		});
	}

};

// normal register of user
exports.registerUser = function(req, res){
	var user = new User();

	user.email = req.body.email;
	user.password = user.generateHash(req.body.password);
	user.account_type = "admin";

	user.save(function(err){
		if(err){
			res.json({status: "error", data: err});
			return;
		}

		res.json({status: "success", data: "User registered successfully."});

	});
};