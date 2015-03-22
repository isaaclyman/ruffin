Meteor.methods({
	/*
		BOARDS
	*/
	makeNewBoard: function(board) {
		if(board.board && board.hobby && board.zip &&
			board.board.toString().length <= 203 &&
			!board.board.toString().match(/[^\w]|_/g) &&
			board.hobby.toString().length <= 200 &&
			!board.hobby.toString().match(/[^\w]|_/g) &&
			board.zip.toString().length === 5 &&
			!board.zip.toString().match(/[^0-9]/g) ) {
				board.zip = board.zip.substring(0,3);
				Boards.insert(board);
		}
	},
	/*
		PEOPLE
	*/
	personExists: function(name) {
		if(name) {
			if( People.find({ name: name }).fetch().length === 0 ) {
				return false;
			} else {
				return true;
			}
		}
	},
	makeNewPerson: function(name, zip, hobby) {
		if( !Meteor.call('personExists', name) ) {
			var person = {
				name: name,
				zip: zip,
				hobbies: [hobby]
			};
			var _id = People.insert(person);
			return _id;
		} else {
			return false;
		}
	},
	/*
		MESSAGES
	*/
	findBoard: function(board_path) {
		if( board_path ) {
			var transformedPath = Meteor.call('transformName', board_path);
			return Boards.find({ board: transformedPath });
		} else {
			return false;
		}
	},
	findBoardMessages: function(board_path) {
		if( board_path && Number(board_path) !== 'NaN' ) {
			var board = Number(board_path);
			return Boards.find({ board: board_path });
		} else {
			return false;
		}
	},

	/*
		AUXILIARY FUNCTIONS
	*/
	transformName: function(name) {
		return newName = name.toString()
							.trim()
							.toLowerCase()
							.replace(/[^\w]|_/g, '');
	}
});