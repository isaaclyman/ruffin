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
	
	username: function() {
		return this.transformName( Session.get('user') || 'anonymous' );
	},
	boardID: function() {
		return this.params._zip.toString().trim() + this.transformName(this.params._board);
	},
	
	transformName: function(name) {
		return newName = name.toString()
						.trim()
						.toLowerCase()
						.replace(/[^\w]/g, '');
	},

	waitOn: function() {
		// make sure 'boards' database is ready
		Meteor.subscribe('boards');
		return Meteor.subscribe('messages', [Meteor.call('')]);
	},

	data: function() {
		// return all messages that match this board
		var board_messages = Messages.find({ board_id: this.boardID },
			{sort: {timestamp : 'desc'} });
		return { messages: board_messages };
	},

	action: function () {
		// set the board name
		Session.set('board', this.params._board);
		var board = this.params._board;
		// if the user is not anonymous
		if(this.username !== 'anonymous') {
			// if the person does not already exist
			if( !Meteor.call('personExists', [this.username]) ) {
				// if creation of the person is successful
				Session.set('user_id', Meteor.makeNewPerson(this.username, this.params._zip, this.params._hobby));
				if( Session.get('user_id') ) {
					// go to the board
					this.render('board');
				} else {
					console.log('user already exists');
					Router.go('/');
				}
			} else {
				console.log('user already exists');
				console.log( People.find({ name: this.username }) );
				//Router.go('/');
			}
		} else {
			Session.set('user', 'anonymous');
			this.render('board');
		}
	},

	unload: function() {
		Session.set('roomId', null);
	}
});