Router.route('/region/:_region/board/:_hobby', {
	// Template to show while subscriptions are loading
	loadingTemplate: 'loading',
	// Template for all boards
	template: 'board',

	waitOn: function() {
		var regionValidation = app.validate.region(this.params._region);
		if(!regionValidation.valid) {
			app.fail('region_invalid', [Router.current().route.path(), this.params, regionValidation]);
			return false;
		}
		var hobbyValidation = app.validate.boardName(this.params._hobby);
		if(!hobbyValidation.valid) {
			app.fail('hobby_invalid', [Router.current().route.path(), this.params, hobbyValidation]);
			return false;
		}

		boardRoute.data.zip   = app.transform.region(this.params._region);
		boardRoute.data.hobby = app.transform.humanToUrl( this.params._hobby );
		boardRoute.data.board = boardRoute.data.zip + boardRoute.data.hobby;
		Meteor.subscribe('LocalBoards', boardRoute.data.zip);

		if( Boards.findOne({ board: boardRoute.data.board }) ) {
			return Meteor.subscribe('Board', boardRoute.data.board);
		}

		// Create board if it doesn't exist
		Meteor.call('makeNewBoard', boardRoute.data, function(error, result) {
			return Meteor.subscribe('Board', boardRoute.data.board);
		});
	},

	data: function() {
		// Set the board as the lexical context
		return Boards.findOne({ board: boardRoute.data.board });
	},

	action: function () {
		// Use the username as long as it's not empty. 
		var username = Meteor.user() ? Meteor.user().username : null;

		if (username && username !== '') {
			// Add the board to the person's profile
			Meteor.call('addBoardToPerson', boardRoute.data.board);
		}
		this.render('board');
		return true;
	}
});

var boardRoute = {
	data: {
		zip: null,
		hobby: null,
		board: null
	}
};