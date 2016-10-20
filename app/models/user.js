// user model
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true
	},
	profile_pic: {
		type: String,
		match: /^http:\/\//i,
		default: "http://www.gravatar.com/avatar"
	},
	created_at: {type: Date},
	account_type: String // can be admin or normal
});

userSchema.pre('save', function(next){
	now = new Date();
	this.created_at = now;
	next();
});

// generating a hash
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check if password is valid
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);