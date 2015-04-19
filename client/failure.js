Template.failure.rendered = function() {
	Session.set('newLink', false);
	Session.set('linkSent', false);
};

Template.failure.events({
	"click #newLink" : function(event) {
		Session.set('newLink', !(Session.get('newLink')));
	},
	"click #sendLink" : function(event) {
		var name = $('#nameInput')[0].value;
		Meteor.call('resendLogin', window.location.host, name);
		Session.set('linkSent', true);
		Session.set('newLink', false);
	}
});

Template.failure.helpers({
	title: function() {
		return 'Ruffin|failed';
	},
	newLink: function() {
		return !!(Session.get('newLink'));
	},
	linkSent: function() {
		return !!(Session.get('linkSent'));
	}
});