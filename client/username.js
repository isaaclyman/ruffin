Template.username.rendered = function() {
	Session.set('chooseEmail', false);
	Session.set('choiceMade' , false);
	Session.set('emailValid', false);
	Session.set('warning_email', '');
	Session.set('email', null);
};

Template.username.events({
	"change .radio-form" : function(event) {
		if(event.target.value !== 'on') {
			return false;
		}
		if(event.target.id === 'noEmail') {
			Session.set('chooseEmail', false);
			Session.set('choiceMade', true);
			Session.set('emailValid', true);
		} else if(event.target.id === 'giveEmail') {
			Session.set('chooseEmail', true);
			Session.set('choiceMade', true);
			if(!Session.get('email')) {
				Session.set('emailValid', false);
			} else {
				Session.set('emailValid', false);
				Meteor.setTimeout(function() {
					$('#email')[0].value = Session.get('email');
				}, 50);
			}
		}
	},
	"change #email" : function(event) {
		var email = event.currentTarget.value;
		Session.set('email', email);
		if(!validateEmail(email)) {
			Session.set('warning_email', 'This doesn\'t look like a valid email address.');
		} else {
			Session.set('warning_email', '');
		}
	},
	"keyup #emailConfirm" : function(event) {
		var email2 = event.currentTarget.value;
		var email1 = Session.get('email');
		Session.set('email2', email2);
		if(email2 !== email1.substring(0, email2.length) ) {
			Session.set('warning_email', 'These email addresses do not match.');
		} else {
			Session.set('warning_email', '');
			if(email1.trim() && email1 === email2 && validateEmail(email2)) {
				Session.set('emailValid', true);
			} else if(!email1.trim()){
				Session.set('warning_email', 'Please enter an email address.');
				Session.set('emailValid', false);
			} else if(!validateEmail(email1)) {
				Session.set('warning_email', 'This doesn\'t look like a valid email address.');
				Session.set('emailValid', false);
			}
		}
	},
	"submit #reserveName" : function(event) {
		event.preventDefault();
		if(event.target[0].value === 'on') {
			Router.go('/region/' + Session.get('zip') + '/board/' + Session.get('hobby'));
		} else if(event.target[1].value === 'on') {
			var email1 = event.target[2].value;
			var email2 = event.target[3].value;
			if(email1 === email2 && validateEmail(email1)) {
				Meteor.apply('verifyThisEmail', [Meteor.userId(), email1], true);
				bootbox.alert('You\'re all set! Check your email soon to verify this address.');
				Router.go('/region/' + Session.get('zip') + '/board/' + Session.get('hobby'));
				return false;
			} else {
				bootbox.alert('Error: Something\'s wrong with this email address. Please look it over and try again.');
				return false;
			}
		}
	}
});

Template.username.helpers({
	title: function() {
		return 'Ruffin|name';
	},
	username: function() {
		return Session.get('username');
	},
	chooseEmail: function() {
		return Session.get('chooseEmail');
	},
	emailValid: function() {
		return !Session.get('emailValid') ? {'disabled': true} : {};
	},
	warning_email: function() {
		return Session.get('warning_email');
	},
	choiceMade: function() {
		return Session.get('choiceMade');
	},
	user_id: function() {
		Session.set('user_id', this);
		return this;
	},
	password: function() {
		Session.set('password', this);
		return this;
	}
});

var validateEmail = function(email) {
	return (email.search(/^.+@.+\..+$/i) !== -1);
}