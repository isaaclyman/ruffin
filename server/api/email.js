Meteor.methods({
	// Email verification
	verifyThisEmail: function(user_id, address) {
		check(user_id, String);
		check(address, String);
		if(user_id !== this.userId) {
			throw new Meteor.Error('Email', 'This user is not logged in.');
			return false;
		}
		Meteor.users.update({ _id: user_id },
							{ $push: { 'emails': address } });
		Accounts.sendVerificationEmail(user_id, address);
	},
	// Login information
	sendNewLogin: function(user_id, address) {
		check(user_id, String);
		check(address, String);
		if(user_id !== this.userId) {
			throw new Meteor.Error('Email', 'This user is not logged in.');
			return false;
		}
		// Send them their original link
	},
	resendLogin: function(username) {
		check(username, String);
		var email = Meteor.users.findOne({ username: username }).emails[0].address;
		// Send them a new link
	}
});