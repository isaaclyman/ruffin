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
			zip: String
		});
		board.board = app.transform.humanToUrl(board.board);
		board.hobby = app.transform.humanToUrl(board.hobby);
		board.zip = app.transform.region(board.zip);
		// Validate each property
		if( !api.validate.boardPath(board.board) ||
			!api.validate.boardName(board.hobby) ||
			!api.validate.region(board.zip) ) {
				return false;
		}
		// Make sure this is a unique board name
		if( Boards.findOne({ board: board.board }) ) {
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
			board: board.board,
			hobby: board.hobby,
			zip: board.zip,
			createdDate: Date.now(),
			cards: [],
			events: [],
			messages : [{
				_id: Random.id(),
				user_id: 'root',
				name: 'Administrator',
				text: welcomeMessage,
				timestamp: Date.now()
			}]
		};
		return true;		
	},
	addBoardDescription: function(board_path, description) {
		check(board_path, String);
		check(description, String);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		if (!api.validate.boardPath(board_path) ||
			!api.validate.boardDescription(description)) {
			return false;
		}
		if(!Boards.findOne({ board: board_path })) {
			throw new Meteor.Error('API',
				'Called addBoardDescription for a board that doesn\'t exist.');
			return false;
		}
		if(Boards.findOne({ board: board_path }).description) {
			throw new Meteor.Error('API',
				'Called addBoardDescription for a board that already has a description.');
			return false;
		}
		Boards.update({ board: board_path }, 
					  {$set: { description: description, described_by: this.userId } });
		return true;
	},
	addCardToBoard: function(board_path, availability, allow_email) {
		check(board_path, String);
		check(availability, String);
		check(allow_email, Boolean);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		if (!api.validate.availability(availability)) {
			return false;
		}
		if (!Boards.findOne({ board: board_path })) {
			throw new Meteor.Error('API',
				'Called addCardToBoard for a board that doesn\'t exist.');
		}
		if (Boards.findOne({ board: board_path, 'cards.user_id': this.userId})) {
			throw new Meteor.Error('API',
				'Called addCardToBoard, but this board already has this user\'s card.');
			return false;
		}
		var newCard = {
			user_id: this.userId,
			username: Meteor.user().username,
			allow_email: allow_email,
			availability: availability
		};
		Meteor.users.update({ _id: this.userId },
							{ $push: { 'profile.cards': board_path } });
		Boards.update({ board: board_path },
					  { $push: { 'cards': newCard } });
		return true;
	},
	removeUserCard: function(board_path) {
		check(board_path, String);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		Meteor.users.update({ _id: this.userId },
							{ $pull: { 'profile.cards': board_path } });
		Boards.update({ board: board_path },
					  { $pull: { cards: { user_id: this.userId } } });
		return true;
	},
	addEventToBoard: function(board_path, title, date, location, description) {
		check(board_path, String);
		check(title, String);
		check(date, Number);
		check(location, String);
		check(description, String);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		if (!Boards.findOne({ board: board_path })) {
			throw new Meteor.Error('API',
				'Called addEventToBoard for a board that doesn\'t exist.');
		}
		if (!api.validate.eventTitle(title) ||
			!api.validate.eventLocation(location) ||
			!api.validate.eventDescription(description)) {
				return false;
		}
		var newEvent = {
			_id: Random.id(),
			host: this.userId,
			title: title,
			date: date,
			location: location,
			description: description,
			attendees: [this.userId]
		};
		Boards.update({ board: board_path },
					  { $push: { events: newEvent } });
		return true;
	},
	cancelEvent: function(board_path, id, title, date) {
		check(board_path, String);
		check(id, String);
		check(title, String);
		check(date, Number);
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		var removeEvent = {
			_id: id,
			host: this.userId,
			title: title,
			date: date
		};
		Boards.update( { board: board_path },
					   { $pull: { events: removeEvent } });
		return true;
	},
	RSVP: function(board_path, id, host, title, date) {
		check(board_path, String);
		check(id, String);
		check(title, String);
		check(date, Number);
		board_path = app.transform.humanToUrl(board_path);
		var matchEvent = {
			_id: id,
			host: host,
			title: title,
			date: date
		};
		Boards.update({ board: board_path, events: { $elemMatch: matchEvent } },
					  { $push: { 'events.$.attendees': this.userId } });
		return true;
	},
	unRSVP: function(board_path, id, host, title, date) {
		check(board_path, String);
		check(id, String);
		check(title, String);
		check(date, Number);
		board_path = app.transform.humanToUrl(board_path);
		var matchEvent = {
			_id: id,
			host: host,
			title: title,
			date: date
		};
		Boards.update({ board: board_path, events: { $elemMatch: matchEvent } },
					  { $pull: { 'events.$.attendees': this.userId } });
		return true;
	},
	/*
		PEOPLE
	*/
	personExists: function(username) {
		check(username, String);
		username = username.toLowerCase();
		if( Meteor.users.findOne({ 'profile.essentialName': username }) ) {
			return true;
		}
		return false;
	},
	makeNewPerson: function(person, recaptcha) {
		check(person, {
			username: String,
			zip: String
		});
		check(recaptcha, String);

		var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, recaptcha);
		if (verifyCaptchaResponse.data.success === false) {
			throw new Meteor.Error('API', 'Recaptcha failed.');
			return false;
		}

		person.username = app.transform.username(person.username);
		person.zip = app.transform.region(person.zip);
		if( Meteor.users.findOne({ 'profile.essentialName': person.username.toLowerCase() }) ) {
			throw new Meteor.Error('API', 'Attempted to create a person that already exists.');
			return false;
		}
		var newPerson = {
			username :  person.username,
			createdAt:  Date.now(),
			profile: {
				essentialName: person.username.toLowerCase(),
				zip: person.zip,
				boards: [],
				messages: [],
				events: [],
				cards: []
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
		check(this.userId, String);
		board_path = app.transform.humanToUrl(board_path);
		if(!api.validate.boardPath(board_path)) {
			return false;
		}
		if( !Meteor.users.findOne({ _id: this.userId }) ) {
			throw new Meteor.Error('API', 'User not found.');
			return false;
		}
		if( Meteor.users.findOne({ _id: this.userId, 'profile.boards': board_path }) )	{
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
		check(zip, String);
		check(this.userId, String);
		zip = app.transform.region(zip);
		Meteor.users.update({ _id: this.userId },
							{ $set: { 'profile.zip': zip }});
		return true;
	},
	/*
		MESSAGES
	*/
	addMessage: function(board_path, text) {
		check(board_path, String);
		check(text, String);
		check(this.userId, String);
		if(text === '' || !api.validate.message(text)) {
			return false;
		}
		var board_path = app.transform.humanToUrl(board_path);
		var message = {
			_id: Random.id(),
			user_id: this.userId,
			name: Meteor.user().username,
			text: text,
			timestamp: Date.now()
		};
		Boards.update({ board: board_path }, 
					  { $push: { 'messages': message } });
		return true;
	},
	deleteMessage: function(board_path, id, timestamp) {
		check(board_path, String);
		check(id, String);
		check(timestamp, Number);
		check(this.userId, String);
		Boards.update({ board: board_path },
					  { $pull: {messages: { user_id: this.userId,
					  						_id: id,
					  						timestamp: timestamp} } });
		return true;
	},
	deleteAllUserMessages: function(confirm) {
		check(confirm, String);
		if(confirm.toLowerCase() !== 'delete all') {
			return false;
		}
		Boards.update({ 'messages.user_id': this.userId },
					  { $pull: {messages: { user_id: this.userId }}},
					  { multi: true });
		return true;
	},
	pMessageSend: function(board, toUser, text) {
		check(board, String);
		check(toUser, String);
		check(text, String);
		check(this.userId, String);
		if(!api.validate.pMessage(text)) {
			return false;
		}
		if(!Boards.findOne({ board: board })) {
			throw new Meteor.Error('API',
				'Tried to send a personal message from a nonexistent board.');
			return false;
		}
		if(!Meteor.users.findOne({ _id: toUser })) {
			throw new Meteor.Error('API',
				'Tried to send a personal message to a user that does\'t exist.');
			return false;
		}
		var pMessage = {
			_id: Random.id(),
			from_id: this.userId,
			from_username: Meteor.user().username,
			to_id: toUser,
			to_username: Meteor.users.findOne({ _id: toUser }).username,
			board: board,
			text: text,
			date: Date.now()
		};
		Meteor.users.update({ _id: toUser },
							{ $push: { 'profile.messages': pMessage }});
		Meteor.users.update({ _id: this.userId },
							{ $push: { 'profile.messages': pMessage }});
		return true;
	},
	pMessageReply: function(id, toUser, text) {
		check(id, String);
		check(toUser, String);
		check(text, String);
		check(this.userId, String);
		if(!api.validate.pMessage(text)) {
			return false;
		}
		if(!Meteor.users.findOne({ _id: toUser })) {
			throw new Meteor.Error('API',
				'Tried to send a message to a user that doesn\'t exist.');
			return false;
		}
		if(!Meteor.users.findOne({ _id: toUser, 'profile.messages._id': id })) {
			Meteor.call('pMessageSend', 'DASHBOARD', toUser, text);
			return true;
		}
		var replyMessage = {
			from_id: this.userId,
			from_username: Meteor.user().username,
			to_id: toUser,
			to_username: Meteor.users.findOne({ _id: toUser }).username,
			text: text,
			date: Date.now()
		};
		Meteor.users.update({ _id: toUser, 'profile.messages._id': id },
							{ $push: { 'profile.messages.$.replies': replyMessage } });
		Meteor.users.update({ _id: this.userId, 'profile.messages._id': id },
							{ $push: { 'profile.messages.$.replies': replyMessage } });
		return true;

	},
	pMessageDelete: function(id) {
		check(id, String);
		check(this.userId, String);
		if(!Meteor.users.findOne({ _id: this.userId, 'profile.messages._id': id })) {
			throw new Meteor.Error('API',
				'Tried to delete a message that doesn\'t exist.');
			return false;
		}
		Meteor.users.update({ _id: this.userId },
							{ $pull: { 'profile.messages': { _id: id } } });
		return true;
	}
});


/*
	LOCAL NAMESPACE
*/
var api = {
	validate: {
		boardPath: function(board_path) {
			return this.process(app.validate.boardPath(board_path));
		},
		boardName: function(name) {
			return this.process(app.validate.boardName(name));
		},
		boardDescription: function(description) {
			return this.process(app.validate.char140(description));
		},
		message: function(message) {
			return this.process(app.validate.char1000(message));
		},
		pMessage: function(message) {
			return this.process(app.validate.char10k(message));
		},
		region: function(region) {
			return this.process(app.validate.region(region));
		},
		availability: function(availability) {
			return this.process(app.validate.char1000(availability));
		},
		eventTitle: function(title) {
			return this.process(app.validate.char140(title));
		},
		eventLocation: function(location) {
			return this.process(app.validate.char1000(location));
		},
		eventDescription: function(description) {
			return this.process(app.validate.char1000(description));
		},
		process: function(validation) {
			if(!validation.valid) {
				throw new Meteor.Error('API', validation.message);
				if(app.debug) {
					console.log(validation.details);
				}
			}
			return validation.valid;
		}
	}
};
