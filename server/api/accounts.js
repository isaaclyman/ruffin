Accounts.validateNewUser(function (person) {
	if (person.name && person.zip && person.hobby &&
		person.name.toString().length <= 36 &&
		person.zip.toString().length >= 3 &&
		!!person.zip.toString().match(/^[0-9]+$/) &&
		person.board.toString().length <= 200 &&
		!!person.board.toString().match(/^[\w]+$/) ) {
			if(Meteor.users.find({ name: person.name }).fetch().length === 0) {
				return true;
			} else {
				throw new Meteor.Error('API','Tried to create a new user, but name already exists.');
			}
		} else {
			throw new Meteor.Error('API', 'Tried to create a new user with invalid arguments.', EJSON.stringify(person));
		}
});