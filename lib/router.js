Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default',
	// use 'pageNotFound' for 404
	notFoundTemplate: 'pageNotFound'
});

Router.route('/', function() {
	// If no user is logged in, clear all data
	if(!Meteor.userId()) {
		Meteor.apply('logOut', [], true);
		Meteor.logout();
		localStorage.clear();
		Session.set({
			user_id: null,
			password: null,
			username: null,
			zip: null,
			hobby: null,
			board: null
		});
	}

	// default page landing is 'Home'
	this.render('home');
});

Router.route('/loading', function() {
	// loading page is 'Loading'
	this.render('loading');
});

// route for reserving a user name
Router.route('reserve/id/:_id/token/:_password', {
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
			} else {
				bootbox.alert('That\'s a bad link! Try again from here.')
				this.redirect('/');
			}
	}
});

// route for letting the user know their email is confirmed
Router.route('/verified', function() {
	this.render('verified');
});

Router.route('/dashboard/user/:_userid/token/:_password', {
	// A dashboard based on the actual database _id of the user's document.
	// They reach this via an email link.
	// ...yeah, yeah, it's kind of like an account.
	onBeforeAction: function() {
		
	},

	action: function() {

	}
});