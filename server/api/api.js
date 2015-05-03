/*
	PUBLIC METHODS
*/
Meteor.methods({
	/*
		BOARDS
	*/
	makeNewBoard: function(board) {
		check(board, {
			board: String,
			hobby: String,
			zip: Number
		});
		var board_path = app.transform.humanToUrl(board.board);
		// Validate each property
		if( !api.validate.boardPath(board.board) ||
			!api.validate.boardName(board.hobby) ||
			!api.validate.region(board.zip.toString()) ) {
				return false;
		}
		// Make sure this is a unique board name
		if( Boards.findOne({ board: board_path }) ) {
			throw new Meteor.Error('API', 
				'Called makeNewBoard for a board that already exists');
			return false;
		}
		// Create the board
		var welcomeMessage =
			'This is a brand new board for people like you: people who ' +
			'like ' + board.hobby + '. Get things moving by introducing ' +
			'yourself, leaving a secure contact card, and setting ' +
			'up an event. Go ahead, be a trendsetter.';
		var newBoard = {
			board: board_path,
			hobby: board.hobby,
			zip: app.transform.region(board.zip),
			createdDate: Date.now(),
			messages : [{
				user_id: 'root',
				name: 'Administrator',
				text: welcomeMessage,
				timestamp: Date.now()
			}]
		};
		return Boards.insert(newBoard);		
	},
	addBoardDescription: function(board_path, description) {
		check(board_path, String);
		check(description, String);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
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


/*
	LOCAL NAMESPACE
*/
var api = {
	getName: function(user_id) {
		check(user_id, String);
		if(!user_id) {
			throw new Meteor.Error('API',
				'Called getName with invalid arguments');
			return false;
		}
		return People.findOne({ _id: user_id }).name;
	},
	validate: {
		boardPath: function(board_path) {
			return this.process(app.validate.boardPath(board_path));
		},
		boardName: function(name) {
			return this.process(app.validate.boardName(name));
		},
		region: function(region) {
			return this.process(app.validate.region(region));
		},
		process: function(validation) {
			if(!validation.valid) {
				throw new Meteor.Error('API', validation.message);
			}
			if(app.debug) {
				console.log(validation.details);
			}
			return validation.valid;
		}
	}
};