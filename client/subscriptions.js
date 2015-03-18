/*
	ALLOW
*/

// Allow boards to be created
Boards.allow({
	'insert' : function(board) {
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

// Allow users to be created
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
	},
	'remove' : function() {
		return true;
	}
});