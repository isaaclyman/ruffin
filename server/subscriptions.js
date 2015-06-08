/*
	PUBLISH
*/

// Publish a specific board
Meteor.publish('board', function(region, hobby) {
	region = app.transform.region(region);
	hobby = app.transform.humanToUrl(hobby);
	return Boards.find({ zip: region, hobby: hobby }, 
					   { fields: { described_by: 0 } });
});

// Publish a list of boards from a specific region
Meteor.publish('localBoards', function(region) {
	region = app.transform.region(region);
	return Boards.find({ zip: region }, { fields: { hobby: 1 } });
});

// Prevent users from editing their profile
Meteor.users.deny({update: function() { return true; }});