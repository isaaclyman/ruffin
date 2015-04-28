Router.route('/region/:_region/board/:_hobby', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		// Check that parameters are defined
		if(!this.params._region || this.params._region === 'NaN') {
			this.redirect('/failure/reason/region_undefined');
			return false;
		}
		if(!this.params._hobby || this.params._hobby === 'undefined') {
			this.redirect('/failure/reason/hobby_undefined');
			return false;
		}

		// Check that parameters are valid
		if(!app.checkRegion(this.params._region)) {
			this.redirect('/failure/reason/region_invalid');
			return false;
		}
		if(!app.checkBoardName(this.params._hobby)); {
			this.redirect('/failure/reason/hobby_invalid');
			return false;
		}

		// Create board if it doesn't exist
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = app.transformToUrl( this.params._hobby );
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
				// Set the board id if it does exist
				Session.set('board_id', result);
				return Meteor.subscribe('boards');
			}
		});
	},

	data: function() {
		// Set the board as the automatic context
		var zip = Number(this.params._region.toString().trim().substring(0,3));
		var hobby = app.transformToUrl( this.params._hobby );
		var board_path = zip + hobby;
		return Boards.findOne({ board: board_path });
	},

	onBeforeAction: function() {
		// Get URL parameters
		var zip = Number(this.params._region.toString().trim().substring(0, 3));
		var hobby = app.transformToHuman( this.params._hobby );

		// Set session variables
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
		// Add the board to the person's profile if not anonymous
		if( username !== 'anonymous' ) {
			Meteor.call('addBoardToPerson', board_path);
			this.render('board');
		} else {
			// Otherwise, set them as anonymous
			Session.set('username', 'anonymous');
			Session.set('user_id', 0);
			this.render('board');
		}
	}
});
