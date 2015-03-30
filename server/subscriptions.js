/*
	PUBLISH
*/

// All boards are public
Meteor.publish('boards', function() {
	return Boards.find();
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
// ^ MOVED TO BOARD: NEED TO IMPLEMENT ^

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