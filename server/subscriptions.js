/*
	PUBLISH
*/

// Publish a specific board
Meteor.publish('Board', function(board) {
	check(board, String);
	var validation = app.validate.boardPath(board);
	if (!validation.valid) {
		throw new Meteor.Error('Publish',
			'Invalid board path. ' + validation.message + validation.details);
		return;
	}
	return Boards.find({ board: board },
					   { fields: { described_by: 0 } });
});

// Publish a list of boards from a specific region
Meteor.publish('LocalBoards', function(region) {
	check(region, String);
	region = app.transform.region(region);
	return Boards.find({ zip: region }, { fields: { board: 1 } });
});

// Prevent users from editing their profile
Meteor.users.deny({ update: function() { return true; } });