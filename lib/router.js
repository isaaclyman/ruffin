Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default',
	// use 'pageNotFound' for 404
	notFoundTemplate: 'pageNotFound'
});

Router.route('/', function() {
	// default page landing is 'Home'
	this.render('Home');
});

Router.route('/loading', function() {
	// loading page is 'Loading'
	this.render('Loading');
});

Router.route('/name', function() {
	this.render('username');
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