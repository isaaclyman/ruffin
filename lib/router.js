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
		var hobby = transformToUrl( this.params._hobby );
		var board_path = zip + hobby;
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
		return Boards.findOne({ _id: Session.get('board_id') });
	},

	onBeforeAction: function() {
		// Get URL parameters
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = transformToHuman( this.params._hobby );

		Session.set('board_path', zip.toString() + hobby);
		Session.set('zip', zip);
		Session.set('hobby', hobby);
		this.next();
	},

	action: function () {
		// use the username as long as it's not empty. Otherwise, 'anonymous'
		var username = Session.get('username');
		var user_id = Session.get('user_id');
		var board_path = Session.get('board_path').replace(/ /g, '_');
		if(!username || username === '') {
			username = 'anonymous';
			user_id = 0;
		}
		if( username !== 'anonymous' ) {
			Meteor.call('addBoardToPerson', board_path, user_id);
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
	onBeforeAction: function() {
		Meteor.call('setPerson', this.params._userid, function(error, result) {
			if(result) {
				this.next();
			} else {
				// Setting the user failed, sorry.
			}
		});
	},

	action: function() {

	}
});


/*
	AUXILIARY FUNCTIONS
*/

var transformToUrl = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/[ ]/g, '_')
				.replace(/[^\w]/g, '');
};

var transformToHuman = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/[^\w ]/g, '');
};