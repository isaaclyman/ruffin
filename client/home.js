Template.home.rendered = function() {
	app.turnOnTooltips();

	home.form.initialize();

	home.trackSubmittable();
};

Template.home.onDestroyed(function() {
	home.clearTrackers();
});

Template.home.events({
	"keyup #nameInput": function (event) {
		var name = event.currentTarget.value;
		Session.set('name', name);
		home.form.validateName(name);
		return;
	},
	"keyup #zipInput": function (event) {
		var zip = event.currentTarget.value;
		Session.set('zip', zip);
		Session.set('zipPerfect', home.form.validateZip(zip));
		return;
	},
	"keyup #hobbyInput": function (event) {
		var hobby = event.currentTarget.value;
		Session.set('hobby', hobby);
		home.form.validateHobby(hobby);
		return;
	},
	"click #lostLink": function (event) {
		bootbox.alert('No worries! Use this page to get a new link.');
		app.fail('access_link', ['user-initiated|home.js|click #lostLink']);
	},
	"submit #begin": function (event) {
		// Don't do a page refresh
		event.preventDefault();

		var username  = app.transformUsername(event.target[0].value);
		var zip       = app.transformRegion(event.target[1].value);
		var hobby     = app.transformToUrl(event.target[2].value);
		var board     = zip + hobby;

		// If user wants to browse anonymously, let it happen
		if(!username || username === '') {
			Meteor.logout();
			Session.setPersistent('user_id', null);
			Session.setPersistent('password', null);
			Session.setPersistent('username', null);
			Session.setPersistent('zip', zip);
			Session.setPersistent('hobby', hobby);
			Session.setPersistent('board', board);
			Router.go('/region/' + zip + '/board/' + hobby);
			return false;
		}
		
		// If the user is trying to log in again as themself, let it happen
		if(Meteor.user() && Meteor.user().username === username) {
			Session.setPersistent('zip', zip);
			Session.setPersistent('hobby', hobby);
			Session.setPersistent('board', board);
			Router.go('/region/' + zip + '/board/' + hobby);
			return false;
		}

		// Stop user if their name is taken
		Meteor.call('personExists', username, function(error, result) {
			if(result) {
				Session.set('warning_name', 'This name is taken.');
				Session.set('nameTaken', true);
				return false;	
			} else {
				// Otherwise, create a user for them
				var newPerson = {
					username: username,
					zip: zip
				};
				Meteor.apply('makeNewPerson', [newPerson], true, function(error, result) {
					Meteor.loginWithPassword({id: result.user_id},result.password);
					Session.setPersistent('username', username);
					Session.setPersistent('zip', zip);
					Session.setPersistent('hobby', hobby);
					Session.setPersistent('board', board);
					Router.go('/reserve/id/' + result.user_id + '/token/' + result.password);
					return false;
				});
			}
		});
	}
});

Template.home.helpers({
	warning_name: function() {
		return Session.get('warning_name');
	},
	warning_zip: function() {
		return Session.get('warning_zip');
	},
	warning_hobby: function() {
		return Session.get('warning_hobby');
	},
	name: function() {
		return Session.get('name');
	},
	namePerfect: function() {
		return Session.get('warning_name') === '';
	},
	zip: function() {
		return Session.get('zip');
	},
	zipPerfect: function() {
		return Session.get('zipPerfect');
	},
	hobby: function() {
		return Session.get('hobby');
	},
	hobbyPerfect: function() {
		return Session.get('hobby') !== '' &&
			   Session.get('warning_hobby') === '';
	},
	submittable: function() {
		return !Session.get('submittable') ? {'disabled': true} : {};
	},
	nameTaken: function() {
		return !!(Session.get('nameTaken'));
	}
});

var home = {
	trackers: [],
	form: {
		initialize: function() {
			Session.setDefault({
				hobby: '',
				name: '',
				nameTaken: false,
				warning_hobby: '',
				warning_name: '',
				warning_zip: '',
				zip: '',
				zipPerfect: false
			});
		},
		validateName: function(name) {
			if( name.length > 36 ) {
				Session.set('warning_name', 'This name is too long.');
				return false;
			}
			Session.set('warning_name', '');
			return true;
		},
		validateZip: function(zip) {
			if( zip.length > 0 && !zip.match(/^[0-9]+$/) ) {
				Session.set('warning_zip', 'Only numbers are allowed.');
				return false;
			} else if ( zip.length > 5 && zip.match(/^[0-9]+$/) ) {
				Session.set('warning_zip', 'Five-digit zip codes only.');
				return false;
			} else if ( !zip.match(/^[0-9]{3,5}$/) ) {
				Session.set('warning_zip', 'This isn\'t a valid zip code.');
				return false;
			}
			Session.set('warning_zip', '');
			return true;
		},
		validateHobby: function(hobby) {
			if( hobby.length > 200 ) {
				Session.set('warning_hobby', 'This hobby is too long.');
				return false;
			}
			Session.set('warning_hobby', '');
			return true;
		}
	},
	clearTrackers: function() {
		var trackers = this.trackers;
		for(var tracker = 0; tracker < trackers.length; tracker++) {
			trackers[tracker].stop();
		}
		return true;
	},
	trackSubmittable: function() {
		var submittable = Tracker.autorun(function () {
			Session.set('submittable',
			   (Session.get('warning_name') === '' &&
				Session.get('warning_zip') === '' &&
				Session.get('warning_hobby') === '' &&
				Session.get('zip') !== '' &&
				Session.get('zipPerfect') &&
				Session.get('hobby') !== '');
			);
		});
		this.trackers.push(submittable);
	}
};