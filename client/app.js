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