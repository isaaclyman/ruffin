/*
	PUBLISH
*/

// All boards are public
Meteor.publish('boards', function() {
	return Boards.find();
});

// Publish (messages in board)
Meteor.publish('messages', function(board) {
	return Messages.find({ board: board });
});

// Publish (people in board)
Meteor.publish('people', function(board) {
	return People.find({ hobbies: board });
});


/*
	ALLOW
*/

// Allow boards to be created
Boards.allow({
	'insert' : function(person, board) {
		if( !Boards.find({ board: board }) ) {
			return true;
		} else {
			return false;
		}
	}
});

// Allow messages to be created, updated and removed
Messages.allow({
	'insert' : function(person, message) {
		// make sure the user is creating their own message (go away h4xx0r)
		if( message.user === person.name ) {
			return true;
		} else {
			return false;
		}
	},
	'update' : function(person, message, fields, modifier) {
		// if the user wants to modify their own message, I say let em
		if( message.user === person.name &&
			fields === ['text', 'timestamp'] &&
			!!modifier.$set.text.toString() ) {
				return true;
		} else {
			return false;
		}
	},
	'remove' : function(person, message) {
		if( message.user === person.name ) {
			return true;
		} else {
			return false;
		}
	}
});

// Allow users to be created and updated
People.allow({
	'insert' : function(name) {
		if( !People.find({ name: name })) {
			return true;
		} else {
			return false;
		}
	},
	'update' : function() {
		return true;
	}
});