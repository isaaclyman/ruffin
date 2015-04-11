Meteor.methods({
	// Email verification
	verifyEmail: function(user_id, address) {
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
	sendLogin: function(user_id, address) {
		check(user_id, String);
		check(address, String);
		if(user_id !== this.userId) {
			throw new Meteor.Error('Email', 'This user is not logged in.');
			return false;
		}

	}
});