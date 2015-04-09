/*
	PUBLISH
*/

// All boards are public
Meteor.publish('boards', function() {
	return Boards.find({}, {fields: {user_id: 0}});
});


/*
	ALLOW
*/

// Allow messages to be inserted, changed, or removed
Boards.allow({
	'update' : function(userId, currentDoc, fieldNames, modifier) {
		if(!userId || fieldNames !== ['messages']) {
			return false;
		}
		if(modifier.$set['messages.text']) {
			console.log(modifier);
		}
	}
});

// Prevent users from editing their profile
Meteor.users.deny({update: function() { return true; }});