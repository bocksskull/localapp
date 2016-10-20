// parks model
var mongoose = require('mongoose');
var randtoken = require('rand-token');

var parksSchema = mongoose.Schema({
	title: String,
	id: String,
	imgUrl: {
		type: String
	},
	created_at: {type: Date},
	last_updated: {type: Date},
	description: String,
	totalLikes: {
		type: Number,
		default: 0
	},
	streetAddress: {type: String},
	city: {type: String},
	state: {type: String},
	country: {type: String},
	zipCode: {type: String},
	amenities: [mongoose.Schema.Types.Mixed],
	// amenities: String,
	location: {
		type: {
			type: 'String',
			default: 'Point'
		},
		coordinates: [Number]
	},
	neighborhood_id: String
});

// parksSchema.index({location: '2dsphere'});

parksSchema.pre('save', function(next){
	now = new Date();
	this.created_at = now;
	this.last_updated = now;
	this.id = randtoken.generate(10);
	next();
});

module.exports = mongoose.model('Park', parksSchema);