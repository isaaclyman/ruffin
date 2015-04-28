var api = {};

/*
	PRIVATE METHODS
*/
api.getName = function(user_id) {
	check(user_id, String);
	if(!user_id) {
		throw new Meteor.Error('API',
			'Called getName with invalid arguments');
		return false;
	}
	return People.findOne({ _id: user_id }).name;
};
api.checkBoardPath = function(board_path) {
	check(board_path, String);
	if(board_path.substring(0,3) === 'NaN') {
		throw new Meteor.Error('API', 'No region defined.');
		return false;
	} else if(board_path.substring(3) === 'undefined') {
		throw new Meteor.Error('API', 'No hobby defined.');
		return false;
	} else if(!board_path.match(/^[\w]{1,203}$/)) {
		throw new Meteor.Error('API', 'Board path match failed.');
		return false;
	}
	return true;
};
api.checkBoardName = function(name) {
	check(name, String);
	if(!name.match(/^[\w]{1,200}$/)) {
		throw new Meteor.Error('API', 'Invalid hobby name.');
		return false;
	}
	return true;
};
api.checkRegion = function(region) {
	check(region, Number);
	if(!region.match(/^[0-9]{3,5}$/)) {
		throw new Meteor.Error('API', 'Invalid region.');
		return false;
	}
	return true;
};
api.transformName = function(name) {
	check(name, String);
	return newName = name.toString()
						 .trim()
						 .toLowerCase()
						 .replace(/[^\w]|_/g, '');
};

/*
	PUBLIC METHODS
*/
Meteor.methods({
	/*
		BOARDS
	*/
	boardExists: function(board_path) {
		check(board_path, String);
		if(!api.checkBoardPath(board_path)) {
			return false;
		}
		if(board_path.length > 203) {
			throw new Meteor.Error('API',
				'Called boardExists with invalid arguments');
			return false;
		}
		board_path = api.transformName(board_path);
		var board = Boards.findOne({ board: board_path });
		if( board ) {
			return board._id;
		}
		return false;
	},
	makeNewBoard: function(board) {
		check(board, {
			board: String,
			hobby: String,
			zip: Number
		});
		if( !api.checkBoardPath(board.board) ||
			!api.checkBoardName(board.hobby) ||
			!api.checkRegion(board.zip) ) {
				return false;
		}
		if( Boards.findOne({ board: board.board }) ) {
			throw new Meteor.Error('API', 
				'Called makeNewBoard for a board that already exists');
			return false;
		}
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
	},
	// TODO: All boards are public, so this can go
	getBoardDescription: function(board_path) {
		check(board_path, String);
		var board = Boards.findOne({ board: board_path });
		return board.description; 
	},
	addBoardDescription: function(board_path, description) {
		check(board_path, String);
		check(description, String);
		check(this.userId, String);
		if(Boards.findOne({ board: board_path }).description) {
			throw new Meteor.Error('API',
				'Called addBoardDescription for a board that already has a description');
			return false;
		}
		Boards.update({ board: board_path }, 
					  {$set: { description: description, described_by: this.userId } });
		return true;
	},
	/*
		PEOPLE
	*/
	personExists: function(username) {
		check(username, String);
		if( Meteor.users.findOne({ username: username }) ) {
			return true;
		}
		return false;
	},
	makeNewPerson: function(person) {
		check(person, {
			username: String,
			zip: Number
		});
		if( Meteor.users.findOne({ username: person.username }) ) {
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
		// Create the user
		var user_id = Accounts.createUser(newPerson);
		// Return the user_id and password (in plaintext)
		//  so that the user's return link can be created, if they want
		return {user_id: user_id, password: newPerson.password};
	},
	addBoardToPerson: function(board_path) {
		check(board_path, String);
		if(!api.checkBoardPath(board_path)) {
			return false;
		}
		if( !Meteor.users.findOne({ _id: this.userId }) ) {
			throw new Meteor.Error('API', 'User not found.');
			return false;
		}
		if( Meteor.users.findOne({ _id: this.userId, "profile.boards": board_path }) )	{
			// No error here; the user is just coming back to a board
			//  that they've visited before.
			// TODO: check this on the client instead
			return false;
		}
		Meteor.users.update({ _id: this.userId }, 
							{ $push: { 'profile.boards': board_path }});
		return true;
	},
	removeBoardFromPerson: function(board_path) {
		check(board_path, String);
		check(this.userId, String);
		Meteor.users.update({ _id: this.userId },
							{ $pull: { 'profile.boards': board_path }});
		return true;
	},
	changeZip: function(zip) {
		check(zip, Number);
		check(this.userId, String);
		zip = Number(zip.toString().substring(0,3));
		Meteor.users.update({ _id: this.userId },
							{ $set: { 'profile.zip': zip }});
		return zip;
	},
	// TODO: this function should be obsolete since an equivalent fn exists on client
	loggedIn: function() {
		return !!(this.userId);
	},
	// TODO: This should be obsolete as well
	alreadyLoggedIn: function(username) {
		check(username, String);
		check(this.userId, String);
		return !!(Meteor.users.findOne({ _id: user_id }).username === username);
	},
	// TODO: this function should not be necessary, since there is a client logout fn
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
	deleteMessage: function(board_path, timestamp) {
		check(board_path, String);
		check(timestamp, Number);
		Boards.update({ board: board_path },
					  { $pull: { messages : { user_id: this.userId, timestamp: timestamp } } });
		return true;
	}
});
