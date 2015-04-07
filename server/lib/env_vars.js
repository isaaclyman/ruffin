Meteor.startup(function() {
	process.env.public = {
		persistent_session: {
			default_method: 'persistent'
		}
	}
});