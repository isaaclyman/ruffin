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
			throw new Meteor.Error('API','Called boardExists with invalid arguments');
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
			board.zip.toString().match(/^[0-9]+$/) ) {
				Meteor.call('boardExists', board.board, function(error, result) {
					if(!result) {
						var newBoard = {
							board: board.board,
							hobby: board.hobby
						};
						newBoard.zip = Number(board.zip.toString().substring(0,3));
						newBoard.createdDate = Date.now();
						return Boards.insert(newBoard);		
					} else {
						Meteor.call('API','Called makeNewBoard for a board that already exists');
						return false;
					}
				});
		} else {
			throw new Meteor.Error('API','Called makeNewBoard with invalid arguments');
			return false;
		}
	},
	getBoardDescription: function(board_id) {
		if(board_id) {
			var board = Boards.findOne({ _id: board_id.toString() });
			return board.description; 
		} else {
			throw new Meteor.Error('API','Called getBoardDescription with invalid arguments');
			return false;
		}
	},
	addBoardDescription: function(board_id, description) {
		if(board_id && description) {
			if(!Boards.findOne({ _id: board_id }).description) {
				Meteor.call('transformName', description, function(error, result) {
					description = result;
					Boards.update({ _id: board_id }, {$set: {description:description} });
					return true;
				});
			} else {
				throw new Meteor.Error('API','Called addBoardDescription for a board that already has a description');
				return false;
			}			
		} else {
			throw new Meteor.Error('API','Called addBoardDescription with invalid arguments');
			return false;
		}
	},
	/*
		PEOPLE
	*/
	personExists: function(name) {
		if(name) {
			if( People.find({ name: name }).fetch().length > 0 ) {
				return true;
			} else {
				return false;
			}
		} else {
			throw new Meteor.Error('API','Called personExists with invalid arguments');
			return false;
		}
	},
	makeNewPerson: function(person) {
		if (person.name && person.zip && person.hobby &&
			person.name.toString().length <= 36 &&
			person.zip.toString().length >= 3 &&
			person.zip.toString().match(/^[0-9]+$/) &&
			person.board.toString().length <= 200 &&
			person.board.toString().match(/^[\w]+$/) ) {
				Meteor.call('personExists', person.name, function(error, result) {
					if(!result) {
						var newPerson = {
							name  : person.name,
							zip   : person.zip,
							boards: [person.board]
						};
						var user_id = People.insert(newPerson);
						this.setUserId(user_id);
						return true;
					} else {
						throw new Meteor.Error('API','Called makeNewPerson for a person that already exists');
						return false;
					}
				});
		} else {
			throw new Meteor.Error('API','Called makeNewPerson with invalid arguments');
			return false;
		}
	},
	setPerson: function(user_id) {
		if(user_id) {
			this.setUserId(user_id);
		}
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
			throw new Meteor.Error('API','Called addMessage with invalid arguments');
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
			throw new Meteor.Error('API','Called editMessage with invalid arguments');
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
			throw new Meteor.Error('API','Called deleteMessage with invalid arguments');
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
	} else {
		throw new Meteor.Error('API','Called getName with invalid arguments');
	}
};