/*
	PUBLISH
*/

// All boards are public
Meteor.publish('boards', function() {
	return Boards.find({}, {fields: {user_id: 0}});
});

// Prevent users from editing their profile
Meteor.users.deny({update: function() { return true; }});