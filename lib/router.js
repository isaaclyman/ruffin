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

	/*waitOn: function() {
		// make sure 'boards' database is ready
		return Meteor.subscribe('boards');
	},

	data: function() {
		// return all messages that match this board
		// TODO: GET FROM BOARD INSTEAD OF MESSAGES
		//var board_messages = Messages.find({ board_id: this.boardID },
		//	{sort: {timestamp : 'desc'} });
		//return { board_messages: board_messages };
	},*/

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
	},

	/*unload: function() {
		
	}*/
});