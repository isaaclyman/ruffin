Template.username.rendered = function() {
	username.form.initialize();
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
		username.validate.email(email);
	},
	"keyup #emailConfirm" : function(event) {
		var email2 = event.currentTarget.value;
		var email1 = Session.get('email');
		Session.set('email2', email2);
		if(email2 !== email1.substring(0, email2.length) ) {
			Session.set('warning_email', 'These email addresses do not match.');
		} else {
			Session.set('warning_email', '');
			if(email1.trim() && email1 === email2 && username.validate.email(email2)) {
				Session.set('emailValid', true);
			} else if(!email1.trim()){
				Session.set('warning_email', 'Please enter an email address.');
				Session.set('emailValid', false);
			} else if(!username.validate.email(email1)) {
				Session.set('warning_email', 'This doesn\'t look like a valid email address.');
				Session.set('emailValid', false);
			}
		}
	},
	"submit #reserveName" : function(event) {
		event.preventDefault();
		if(!Session.get('chooseEmail')) {
			Router.go('/region/' + this.region + '/board/' + this.hobby);
		} else {
			var email1 = event.target[2].value;
			var email2 = event.target[3].value;
			if(email1 === email2 && username.validate.email(email1)) {
				Meteor.apply('verifyThisEmail', [email1], true);
				bootbox.alert('You\'re all set! Check your email soon to verify this address.');
				Router.go('/region/' + this.region + '/board/' + this.hobby);
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
		if(!Meteor.user()) {
			return ' ';
		}
		return app.transform.maybeEjson(Meteor.user().username);
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
	}
});

var username = {
	form: {
		initialize: function() {
			Session.set({
				chooseEmail: false,
				choiceMade: false,
				warning_email: '',
				email: null
			});
		}
	},
	validate: {
		email: function(email) {
			var validation = app.validate.email(email);
			Session.set('warning_email', validation.message);
			return validation.valid;
		}
	}
};