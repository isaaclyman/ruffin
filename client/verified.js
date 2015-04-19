Template.verified.rendered = function() {
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
		return !!(Meteor.userId());
	}
});