// neighborhood model
var mongoose = require('mongoose');
var randtoken = require('rand-token');

var neighborhoodSchema = mongoose.Schema({
	title: String,
	imgUrl: {
		type: String,
		default: "http://www.planetware.com/photos-large/USNY/new-york-city-central-park-1.jpg"
	},
	totalParks: {
		type: Number,
		default: 0
	},
	created_at: {type: Date},
	last_updated: {type: Date},
	id: String
});

neighborhoodSchema.pre('save', function(next){
	now = new Date();
	this.created_at = now;
	this.last_updated = now;
	this.id = randtoken.generate(10);
	next();
});

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);