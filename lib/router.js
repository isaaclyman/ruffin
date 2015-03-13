Router.configure({
	layoutTemplate: 'default'
});

Router.route('/', function() {
	this.render('Home');
});

Router.route('/board/:_id', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',

	waitOn: function() {
		return Meteor.subscribe('board', this.params._id);
	},

	action: function () {
		this.render('board');
	},
});