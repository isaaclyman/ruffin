// Meteor will interpret this as a global object
app = {};

// For board URLs: trim, lowercase, replace spaces with _, remove non-word characters
app.transformToUrl = function(name) {
	return name.toString()
			   .trim()
			   .toLowerCase()
			   .replace(/ /g, '_')
			   .replace(/[^\w\d_]/g, '');
};
// For human-readable: trim, lowercase, replace _ with space, remove non-word
//   non-space characters
app.transformToHuman = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/[^\w\d ]/g, '');
};

app.transformUsername = function(name) {
	return name.toString().toLowerCase().trim();
};
app.transformRegion = function(zip) {
	return Number(zip.toString().substring(0,3));
};

// These should be the same on client and server
app.checkRegion = function(region) {
	if(!region.match(/^[0-9]{3,5}$/)) {
		return false;
	}
	return true;
};
app.checkBoardName = function(name) {
	if(!name.match(/^[\w\d_]{1,200}$/)) {
		return false;
	}
	return true;
};

// Set page title dynamically
Handlebars.registerHelper("setTitle", function(title) {
	if(title) {
		document.title = title;
	} else {
		document.title = "Ruffin";
	}
});

// Add favicon programmatically (a workaround)
Template.default.rendered = function() {
	var link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.sizes = '16x16 32x32';
    link.href = '/favico.png';
    document.getElementsByTagName('head')[0].appendChild(link);
};

// Verify email via link
Accounts.onEmailVerificationLink(function(token, done) {
	Accounts.verifyEmail(token);
	Session.setPersistent('andVerified', true);
	done();
});