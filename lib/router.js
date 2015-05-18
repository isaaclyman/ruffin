Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default',
	// use 'pageNotFound' for 404
	notFoundTemplate: 'pageNotFound'
});

Router.route('/', {
	onBeforeAction: function() {
		if (Accounts._verifyEmailToken) {
			Accounts.verifyEmail(Accounts._verifyEmailToken, function(err) {
				if (err) {
					app.fail('verify_failed', [err, Accounts._verifyEmailToken]);
				} else {
					Router.go('/verified');
				}
			});
			return;
		}

		if(!Meteor.userId() && !Meteor.loggingIn()) {
			this.next();
		} else {
			if(Meteor.user()) {
				this.redirect('/dashboard/user/' + Meteor.user().username);
			}
		}
	},

	action: function() {
		this.render('home');
	}
});

Router.route('/loading', function() {
	// loading page is 'Loading'
	this.render('loading');
});

// route for reserving a user name
Router.route('/reserve/id/:_id/token/:_password/board/:_region/:_hobby', {
	data: function() {
		return {
			user_id: this.params._id,
			password: this.params._password,
			region: this.params._region,
			hobby: this.params._hobby
		};
	},
	action: function() {
		if (Meteor.userId() &&
			Meteor.userId() === this.params._id) {
				this.render('username');
			} else if(!Meteor.loggingIn()) {
				app.fail('reserve_username_no_login', [Router.current().route, Meteor.userId(), this.params]);
			}
	}
});

// route for letting the user know their email is confirmed
Router.route('/verified', {

	onBeforeAction: function() {
		if(Meteor.userId()) {
			this.next();
		}
	},

	action: function () {
		this.render('verified');
	}
});

Router.route('/set/user/:_userid/token/:_password', {
	// Set name based on the actual database _id of the user's document.
	// They reach this via an email link.
	// ...yeah, yeah, it's kind of like an account.
	onBeforeAction: function() {
		Meteor.loginWithPassword({ id: this.params._userid },
								 this.params._password,
								 function(error) {
			if(error) {
				app.fail('setting_user', [error, Router.current().route, this.params]);
			}
		});
		this.next();
	},

	action: function() {
		if(Meteor.user()) {
			this.redirect('/dashboard/user/' + Meteor.user().username);
			return true;
		}
		if(Meteor.loggingIn()) {
			this.render('loading')
			return false;
		}
		app.fail('login_failed', [Router.current().route, this.params, Meteor.user()]);
		return true;
	}
});

Router.route('/failure/reason/:_reason', {
	data: function() {
		return {reason: this.params._reason};
	},
	action: function () {
		this.render('failure');
	}
});

Router.route('/dashboard/user/:_username', {
	data: function() {
		return Meteor.user();
	},

	onBeforeaction: function() {
		if(Meteor.user()) {
			if(Meteor.user().username !== this.params._username) {
				this.redirect('failure/reason/correct_user_dashboard');
			}
		}
	},

	action: function() {
		this.render('dashboard');
	}
});
