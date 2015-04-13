Meteor.methods({
	/*
		BOARDS
	*/
	boardExists: function(board_path) {
		check(board_path, String);
		if(board_path.length <= 203) {
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
		check(board, {
			board: String,
			hobby: String,
			zip: Number
		});
		if( board.board.toString().length <= 203 &&
			board.board.toString().match(/^[\w]+$/) &&
			board.hobby.toString().length <= 200 &&
			board.hobby.toString().match(/^[\w]+$/) &&
			board.zip.toString().length >= 3 &&
			board.zip.toString().match(/^[0-9]+$/) ) {
				if(Boards.find({ board: board.board }).fetch().length === 0) {
					var welcomeMessage = 'This is a brand new board for people like you: people who like ' + 
										 board.hobby + '. Get things moving by introducing ' +
										 'yourself, leaving a secure contact card, and setting ' +
										 'up an event. Go ahead, be a trendsetter.';
					var newBoard = {
						board: board.board,
						hobby: board.hobby,
						messages : [{
							user_id: 'root',
							name: 'Administrator',
							text: welcomeMessage,
							timestamp: Date.now()
						}]
					};
					newBoard.zip = Number(board.zip.toString().substring(0,3));
					newBoard.createdDate = Date.now();
					return Boards.insert(newBoard);		
				} else {
					throw new Meteor.Error('API','Called makeNewBoard for a board that already exists');
					return false;
				}
			} else {
				throw new Meteor.Error('API','Called makeNewBoard with invalid arguments');
				return false;
			}
	},
	getBoardDescription: function(board_path) {
		check(board_path, String);
		var board = Boards.findOne({ board: board_path });
		return board.description; 
	},
	addBoardDescription: function(board_path, description) {
		check(board_path, String);
		check(description, String);
		if(!this.userId) {
			throw new Meteor.Error('API', 'Attempted to add a description without having a username.');
			return false;
		}
		if(!Boards.findOne({ board: board_path }).description) {
			Boards.update({ board: board_path }, 
						  {$set: { description: description, described_by: this.userId } });
			return true;
		} else {
			throw new Meteor.Error('API','Called addBoardDescription for a board that already has a description');
			return false;
		}
	},
	/*
		PEOPLE
	*/
	personExists: function(username) {
		check(username, String);
		if( Meteor.users.find({ username: username }).fetch().length > 0 ) {
			return true;
		} else {
			return false;
		}
	},
	makeNewPerson: function(person) {
		check(person, {
			username: String,
			zip: Number
		});
		if( Meteor.users.find({ username: person.username }).fetch().length > 0) {
			throw new Meteor.Error('API', 'Attempted to create a person that already exists.');
			return false;
		}
		var newPerson = {
			username :  person.username,
			createdAt:  Date.now(),
			profile: {
				zip: person.zip,
				boards: []
			}
		};
		// Generate a random password for this person
		var passlen  = (Math.floor((Math.random() * 10) + 15));
		newPerson.password = Random.id(passlen);
		var user_id = Accounts.createUser(newPerson);
		this.setUserId(user_id);
		return {user_id: user_id, password: newPerson.password};
	},
	addBoardToPerson: function(board_path, user_id) {
		check(board_path, String);
		check(user_id, String);
		if( Meteor.users.find({ _id: user_id }).fetch().length > 0 ) {
			if( Meteor.users.find({ _id: user_id, "profile.boards": board_path })
				.fetch().length === 0 ) {
					Meteor.users.update({ _id: user_id }, 
										{ $push: { 'profile.boards': board_path }});
					return true;
			} else {
				// No error here; the user is just coming back to a board
				//  that they've visited before.
				return false;
			}
		} else {
			throw new Meteor.Error('API', 'User not found.');
			return false;
		}
	},
	loggedIn: function() {
		return !!(this.userId);
	},
	alreadyLoggedIn: function(username) {
		check(username, String);
		var user_id = this.userId;
		if(!user_id) {
			return false;
		} else {
			return !!(Meteor.users.findOne({ _id: user_id }).username === username);
		}
	},
	logOut: function() {
		this.setUserId(null);
		return true;
	},
	/*
		MESSAGES
	*/
	addMessage: function(board_path, text) {
		check(board_path, String);
		check(text, String);
		if(text === '') {
			return false;
		}
		var username = Meteor.user().username;
		var message = {
			user_id: this.userId,
			name: username,
			text: text,
			timestamp: Date.now()
		};
		Boards.update({ board: board_path }, 
					  { $push: { 'messages': message } });
		return true;
	},
	editMessage: function(board_path, timestamp, text) {
		check(board_path, String);
		check(timestamp, Date);
		check(text, String);
		Boards.update({ _id: board_id, 'messages.user': this.userId, 'messages.timestamp': timestamp },
					  { $set: { 'messages.$.text' : text } });
		return true;
	},
	deleteMessage: function(board_path, timestamp) {
		check(board_path, String);
		check(timestamp, Date);
		Boards.update({ _id: board_id },
					  { $pull: { messages : { user: this.userId, timestamp: timestamp } } });
		return true;
	},
	/*
		AUXILIARY FUNCTIONS
	*/
	transformName: function(name) {
		check(name, String);
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