// Verify email via link
Accounts.onEmailVerificationLink(function(token, done) {
	Accounts.verifyEmail(token);
	done();
});