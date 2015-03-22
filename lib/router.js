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

Router.route('/zip/:_zip/board/:_hobby', {
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
		return { messages: board_messages };
	},

	onBeforeAction: function() {
		var transformName = function(name) {
			return name.toString()
					.trim()
					.toLowerCase()
					.replace(/[^\w]|_/g, '');
		};
		var username = transformName( Session.get('user') || 'anonymous' );
		var zip = Number(this.params._zip.toString().trim().substr(0, 3));
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
	},

	unload: function() {
		Session.set('roomId', null);
	}
});