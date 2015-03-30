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

Router.route('/region/:_region/board/:_hobby', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		// Create board if it doesn't exist
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = transformName( this.params._hobby );
		var board_path = zip.toString() + hobby;
		Meteor.call('boardExists', board_path, function(error, result) {
			if(!result) {
				var newBoard = {
					board: board_path,
					hobby: hobby,
					zip  : zip
				};
				Meteor.call('makeNewBoard', newBoard, function(error, result) {
					Session.set('board_id', result);
					return Meteor.subscribe('boards');
				});
			} else {
				Session.set('board_id', result);
				return Meteor.subscribe('boards');
			}
			// Make sure Boards database is ready
		});
	},

	data: function() {
		// return all messages that match this board
		var board_messages = Boards.findOne({ _id: Session.get('board_id') }).messages;
		return { board_messages: board_messages };
	},

	onBeforeAction: function() {
		// Get URL parameters
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
		var username = Session.get('username');
		if(!username || username === '') {
			username = 'anonymous';
		}
		if( username !== 'anonymous' ) {
			this.render('board');
		} else {
			Session.set('username', 'anonymous');
			Session.set('user_id', 0);
			this.render('board');
		}
	}
});

Router.route('/dashboard/user/:_userid', {
	// A dashboard based on the actual database _id of the user's document.
	// They reach this via an email link.
	// ...yeah, yeah, it's kind of like an account.
});


/*
	AUXILIARY FUNCTIONS
*/

var transformName = function(name) {
return name.toString()
		   .trim()
		   .toLowerCase()
		   .replace(/[^\w]|_/g, '');
};