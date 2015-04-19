var boardroute = {};
boardroute.transformToUrl = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/[ ]/g, '_')
				.replace(/[^\w]/g, '');
};

boardroute.transformToHuman = function(name) {
	return name.toString()
				.trim()
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/[^\w ]/g, '');
};

Router.route('/region/:_region/board/:_hobby', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		// Check parameters
		if(!this.params._region || this.params._region === 'NaN') {
			this.redirect('/failure/reason/region_undefined');
		}
		if(!this.params._hobby || this.params._hobby === 'undefined') {
			this.redirect('/failure/reason/hobby_undefined');
		}

		// Create board if it doesn't exist
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = boardroute.transformToUrl( this.params._hobby );
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
		var hobby = boardroute.transformToHuman( this.params._hobby );

		Session.set('board_path', zip.toString() + hobby);
		Session.set('zip', zip);
		Session.set('hobby', hobby);
		this.next();
	},

	action: function () {
		// use the username as long as it's not empty. Otherwise, 'anonymous'
		var username = Session.get('username');
		var user_id = Meteor.userId();
		var board_path = Session.get('board_path');
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
