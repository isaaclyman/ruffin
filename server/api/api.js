Meteor.methods({
	/*
		BOARDS
	*/
	boardExists: function(board_path) {
		if(board_path && board_path.toString().length <= 203) {
			Meteor.call('transformName', board_path, function(error, result) {
				board_path = result;
				var board = Boards.findOne({ board: board_path });
				if( board ) {
					return board._id;
				} else {
					return false;
				}
			});
		} else {
			return false;
		}
	},
	makeNewBoard: function(board) {
		if(board.board && board.hobby && board.zip &&
			board.board.toString().length <= 203 &&
			board.board.toString().match(/^[\w]+$/) &&
			board.hobby.toString().length <= 200 &&
			board.hobby.toString().match(/^[\w]+$/) &&
			board.zip.toString().length >= 3 &&
			board.zip.toString().match(/^[0-9]+$/) &&
			Boards.find({ board: board }).fetch().length === 0 ) {
				board.zip = Number(board.zip.toString().substring(0,3));
				board.createdDate = Date.now();
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
			Meteor.call('transformName', description, function(error, result) {
				description = result;
				Boards.update({ _id: board_id }, {$set: {description:description} });
				return true;
			});
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
		Meteor.call('personExists', name, function(error, result) {
			if(result) {
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
		});
	},
	/*
		MESSAGES
	*/
	addMessage: function(user_id, board_id, text) {
		// Make sure the user is who they say they are
		if (board_id && 
			user_id && 
			text && 
			text !== '' && 
			user_id === Meteor.user()) {
				var message = {
					user: user_id,
					name: getName(user_id),
					text: text,
					timestamp: Date.now()
				};
				Boards.update({ _id: board_id }, 
							  { $push: { messages: message } });
				return true;
		} else {
			return false;
		}
	},
	editMessage: function(user_id, board_id, timestamp, text) {
		if (user_id &&
			user_id === Meteor.user() &&
			board_id &&
			timestamp &&
			text &&
			text !== '') {
				Boards.update({ _id: board_id, "messages.user": user_id, "messages.timestamp": timestamp },
							  { $set: { "messages.$.text" : text } });
				return true;
		} else {
			return false;
		}
	},
	deleteMessage: function(user_id, board_id, timestamp) {
		if (user_id &&
			user_id === Meteor.user() &&
			board_id &&
			timestamp &&
			text) {
				Boards.update({ _id: board_id },
							  { $pull: { messages : { user: user_id, timestamp: timestamp } } });
				return true;
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


/*
	PRIVATE METHODS
*/
var getName = function(user_id) {
	if(user_id) {
		return People.findOne({ _id: user_id }).name;
	}
};