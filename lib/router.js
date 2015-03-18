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

Router.route('/zip/:_zip/board/:_board', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',
	boardID: function() {
		return this.params._zip.toString().trim() + this.transformBoardName(this.params._board);
	},
	
	transformBoardName: function(name) {
		return newName = name.toString()
						.trim()
						.toLowerCase()
						.replace(/[^\w]/g, '');
	},

	waitOn: function() {
		// make sure 'boards' database is ready
		return Meteor.subscribe('boards', this.boardID);
	},

	data: function() {
		// return all messages that match this board
		var board_messages = Messages.find({ board: this.boardID },
			{sort: {timestamp : 'desc'} });
		return { messages: board_messages };
	},

	action: function () {
		// set the board name
		Session.set('board', this.params._board);
		var board = this.params._board;
		// set the user name, or make anonymous
		var username = Session.get('user') || 'anonymous';
		// add the board to the user's hobbies if not anonymous
		if(username !== 'anonymous') {
			People.update({ name: username }, {$addToSet: { hobbies: board }});
		}
		// show the board
		this.render('board');
	},

	unload: function() {
		Session.set('roomId', null);
	}
});