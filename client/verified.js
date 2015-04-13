Template.verified.rendered = function() {
	Session.setDefault('loggedIn', false);
	Meteor.call('loggedIn', function(error, result) {
		Session.set('loggedIn', result);
	});
};

Template.verified.events({
	"click #toDashboard" : function(event) {
		var username = Meteor.user().username;
		if(username) {
			Router.go('/dashboard/user/' + username);
		} else {
			Session.set('loggedIn', false);
		}
	}
});

Template.verified.helpers({
	title: function() {
		return 'Ruffin|verified';
	},
	loggedIn: function() {
		return !!(Session.get('loggedIn'));
	}
});