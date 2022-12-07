const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema( {
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String,
  ptero_id: Number,
  codrocoins: Number,
  verified: Boolean,
  verificationcode: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
}),
User = mongoose.model('User', userSchema);

module.exports = User;