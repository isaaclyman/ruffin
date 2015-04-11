Template.username.rendered = function() {
	Session.set('chooseEmail', false);
	Session.set('choiceMade' , false);
	Session.set('emailValid', false);
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
			if(!Session.get('email')) {
				Session.set('emailValid', false);
			} else {
				Session.set('emailValid', validateEmail(Session.get('email')));
			}
			Session.set('chooseEmail', true);
			Session.set('choiceMade', true);
		}
	},
	"keyup #email" : function(event) {
		var email = event.currentTarget.value;
		Session.set('email', email);
		if(validateEmail(email)) {
			Session.set('emailValid', true);
		} else {
			Session.set('emailValid', false);
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
	choiceMade: function() {
		return Session.get('choiceMade');
	}
});

var validateEmail = function(email) {
	return email.search(/^[.]+@[.]+\.[.]+$/) !== -1;
}