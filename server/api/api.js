Meteor.methods({
	/*
		BOARDS
	*/
	boardExists: function(board_path) {
		if(board_path && board_path.toString().length <= 203) {
			board_path = Meteor.call('transformName', board_path);
			var board = Boards.findOne({ board: board_path });
			if( board ) {
				return board._id;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},
	makeNewBoard: function(board) {
		if(board.board && board.hobby && board.zip &&
			board.board.toString().length <= 203 &&
			!board.board.toString().match(/[^\w]|_/g) &&
			board.hobby.toString().length <= 200 &&
			!board.hobby.toString().match(/[^\w]|_/g) &&
			board.zip.toString().length === 5 &&
			!board.zip.toString().match(/[^0-9]/g &&
			!Boards.findOne({ board: board }).length > 0 ) ) {
				board.zip = Number(board.zip.toString().substring(0,3));
				board.createdDate = (new Date).toTimeString();
				return Boards.insert(board);
		} else {
			return false;
		}
	},
	getBoardDescription: function(board_id) {
		if(board_id) {
			var board = Boards.findOne({ _id: board_id.toString() });
			return board.description; 
		} else {
			return false;
		}
	},
	addBoardDescription: function(board_id, description) {
		if(board_id && description && !Boards.findOne({ _id: board_id }).description ) {
			description = Meteor.call('transformName', description);
			Boards.update({ _id: board_id }, {$set: {description:description} });
		} else {
			return false;
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