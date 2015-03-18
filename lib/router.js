Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default'
});

Router.route('/', function() {
	// default page landing is 'Home'
	this.render('Home');
});

Router.route('/loading', function() {
	// loading page is 'Loading'
	this.render('Loading');
});

Router.route('/board/:_id', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		// make sure 'boards' database is ready
		return Meteor.subscribe('boards', this.params._id);
	},
	data: function() {
		// return all messages that match this board
		var board_messages = Messages.find({ board: this.params._id },
			{sort: {timestamp : 'desc'} });
		return { messages: board_messages };
	},

	action: function () {
		this.render('board');
	},
});