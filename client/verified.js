Template.verified.rendered = function() {
	Meteor.call('sendNewLogin', window.location.host);
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