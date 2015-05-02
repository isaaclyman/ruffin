// Verify email via link
Accounts.onEmailVerificationLink(function(token, done) {
	Accounts.verifyEmail(token);
	Session.setPersistent('andVerified', true);
	done();
});