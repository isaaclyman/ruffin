Accounts.validateNewUser(function (person) {
	if (person.username.toString().length <= 36 &&
		person.profile.zip.toString().length >= 3 &&
		!!person.profile.zip.toString().match(/^[0-9]+$/) ) {
			if(Meteor.users.find({ name: person.username }).fetch().length === 0) {
				return true;
			} else {
				throw new Meteor.Error('API','Tried to create a new user, but name already exists.');
			}
		} else {
			throw new Meteor.Error('API', 'Tried to create a new user with invalid arguments.');
			console.log(person);
		}
});