var emailApi = {};
emailApi.loginEmail = function (root_url, user_id, password) {
	var link = 'http://' + root_url + '/set/user/' + user_id + '/token/' + password;
	var html =
    '<h1 style=\
    "Margin-top: 0;color: #565656;font-weight: 700;font-size: 36px;Margin-bottom: 18px;font-family: sans-serif;line-height: 42px">\
    This is your exclusive Ruffin access link.</h1>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    Hold onto it. There\'s no other way for you to use your unique username.</p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    <a href="' + link + '">' + link + '</a></p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    Use this link any time you want to access the site, but don\'t share it with anyone.</p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    Thanks! You\'re the greatest.</p>';
    return html;
};
emailApi.verifyRoot = function (root) {
	if (root !== 'localhost:3000' &&
		root !== 'ruffin.meteor.com') {
			return false;	
	}
	return true;
};

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
							{ $set: { 'emails': [{ address: address, verified: false }] } });
		Accounts.sendVerificationEmail(user_id, address);
	},
	// Login information
	sendNewLogin: function(root_url, user_id) {
		check(root_url, String);
		check(user_id, String);
		if (!emailApi.verifyRoot(root_url)) {
			throw new Meteor.Error('Email','URL is invalid.');
			return false;
		}
		// Get email address
		var user = Meteor.users.findOne({ _id: user_id });
		var address  = user.emails[0].address;
		// Change their password and send them their original link
		var passlen  = (Math.floor((Math.random() * 10) + 15));
		var password = Random.id(passlen);
		Accounts.setPassword(user_id, password);
		Email.send({
			from: 'Do Not Reply - Ruffin',
			to  :  address,
			subject: 'Here is your Ruffin access link.',
			html:  emailApi.loginEmail(root_url, user_id, password)
		});
	},
	resendLogin: function(root_url, username) {
		check(root_url, String);
		check(username, String);
		if (!emailApi.verifyRoot(root_url)) {
			throw new Meteor.Error('Email', 'URL is invalid.');
			return false;
		}
		// Get email address and user id
		var user = Meteor.users.findOne({ username: username })
		var address = user.emails[0].address;
		var user_id = user._id;
		// Change their password and send them a new link
		var passlen  = (Math.floor((Math.random() * 10) + 15));
		var password = Random.id(passlen);
		Accounts.setPassword(user_id, password);
		Email.send({
			from: 'Do Not Reply - Ruffin',
			to  :  address,
			subject: 'You requested a replacement Ruffin access link.',
			html:  emailApi.loginEmail(root_url, user_id, password)
		});
	}
});
