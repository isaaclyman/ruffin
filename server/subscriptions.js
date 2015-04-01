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

// Prevent users from editing their profile
Meteor.users.deny({update: function() { return true; }});