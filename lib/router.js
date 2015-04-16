Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default',
	// use 'pageNotFound' for 404
	notFoundTemplate: 'pageNotFound'
});

Router.route('/', {
	onBeforeAction: function() {
		if(!Meteor.userId() && !Meteor.loggingIn()) {
			localStorage.clear();
			Session.set({
				user_id: null,
				password: null,
				username: null,
				zip: null,
				hobby: null,
				board: null
			});
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
Router.route('/reserve/id/:_id/token/:_password', {
	data: function() {
		return {user_id: this.params._id,
				password: this.params._password};
	},
	action: function() {
		if(Meteor.userId() &&
			Meteor.userId() === this.params._id &&
			Session.get('username') &&
			Session.get('zip') &&
			Session.get('hobby')) {
				this.render('username');
			} else if(!Meteor.loggingIn()) {
				bootbox.alert('That\'s a bad link! Try again from here.')
				this.redirect('/');
			}
	}
});

// route for letting the user know their email is confirmed
Router.route('/verified', function() {
	this.render('verified');
});

Router.route('/set/user/:_userid/token/:_password', {
	// Set name based on the actual database _id of the user's document.
	// They reach this via an email link.
	// ...yeah, yeah, it's kind of like an account.
	onBeforeAction: function() {
		var that = this;
		Meteor.loginWithPassword({ id: this.params._userid },
								 this.params._password,
								 function(error) {
			if(error) {
				that.redirect('/failure/reason/setting_user');
			} else {
				that.next();
			}
		});
	},

	action: function() {
		if(Meteor.user()) {
			this.redirect('/dashboard/user/' + Meteor.user().username);
		}
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
			} else {
				Session.setPersistent('username', this.params._username);
				console.log(this.params._username);
			}
		}
	},

	action: function() {
		this.render('dashboard');
	}
});