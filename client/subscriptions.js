/*
	ALLOW
*/

// VALIDATION IS HANLDED SERVER-SIDE
// This is here for reactive optimization

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

// Allow messages to be created
Messages.allow({
	'insert' : function(person, message) {
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
	}
});