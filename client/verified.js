Template.verified.rendered = function() {
	if(Session.get('andVerified')) {
		Meteor.call('sendNewLogin', window.location.host, Meteor.userId());
	}
	Session.setPersistent('andVerified', false);
};

Template.verified.events({
	"click #toDashboard" : function(event) {
		var username = Meteor.user().username;
		if(username) {
			Router.go('/dashboard/user/' + username);
		}
	}
});

Template.verified.helpers({
	title: function() {
		return 'Ruffin|verified';
	},
	loggedIn: function() {
		return !!(Meteor.userId());
	}
});