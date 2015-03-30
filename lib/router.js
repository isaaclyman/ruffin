Router.configure({
	// use 'default' for all pages
	layoutTemplate: 'default',
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

Router.route('/region/:_region/board/:_hobby', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		// make sure 'boards' database is ready
		Meteor.subscribe('boards');
		return Meteor.subscribe('messages', this.boardID);
	},

	data: function() {
		// return all messages that match this board
		var board_messages = Messages.find({ board_id: this.boardID },
			{sort: {timestamp : 'desc'} });
		return { board_messages: board_messages };
	},

	onBeforeAction: function() {
		var transformName = function(name) {
			return name.toString()
					.trim()
					.toLowerCase()
					.replace(/[^\w]|_/g, '');
		};
		var username = transformName( Session.get('user') || 'anonymous' );
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = transformName( this.params._hobby );
		Session.set('board_path', zip.toString() + hobby);
		Session.set('username', username);
		Session.set('zip', zip);
		Session.set('hobby', hobby);
		this.next();
	},

	action: function () {
		// use the username as long as it's not empty. Otherwise, 'anonymous'
		var username = Session.get('username') !== '' ? Session.get('username') : 'anonymous';
		if( username !== 'anonymous' ) {
			// if the person does not already exist
			if( !Meteor.call('personExists', username) ) {
				// create the person
				Session.set('user_id', Meteor.call('makeNewPerson', username, Session.get('zip'), Session.get('hobby')));
				// go to the board
				this.render('board');
			} else {
				console.log('user already exists');
				console.log( People.find({ name: this.username }) );
				//Router.go('/');
			}
		} else {
			Session.set('username', 'anonymous');
			this.render('board');
		}
		// create the board if it doesn't exist
		var board = Meteor.call('boardExists', Session.get('board_path'));
		if(board) {
			Session.set('board_id', board);
		} else {
			var board = {
				board: Session.get('board_path'),
				hobby: Session.get('hobby'),
				zip: Session.get('zip')
			};
			Meteor.call('makeNewBoard', board);
		}
	},

	unload: function() {
		Session.set('roomId', null);
	}
});