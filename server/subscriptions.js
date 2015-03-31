/*
	PUBLISH
*/

// All boards are public
Meteor.publish('boards', function() {
	return Boards.find();
});


/*
	ALLOW
*/

// Allow boards to be created
Boards.allow({
	'insert' : function(person, board) {
		if( Boards.find({ board: board }).fetch().lenth === 0 ) {
			return true;
		} else {
			return false;
		}
	}
});

// Allow messages to be created, updated and removed
// ^ MOVED TO BOARD: NEED TO IMPLEMENT ^

// Allow users to be created and updated
Users.allow({
	'insert' : function(name) {
		if( Users.find({ name: name }).fetch().length === 0 ) {
			return true;
		} else {
			return false;
		}
	}
});