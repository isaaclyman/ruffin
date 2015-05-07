Template.home.rendered = function() {
	app.turnOnTooltips();

	home.form.initialize();

	home.trackSubmittability();
};

Template.home.onDestroyed(function() {
	home.clearTrackers();
});

Template.home.events({
	"keyup #nameInput": function (event) {
		var name = event.currentTarget.value;
		Session.set('name', name);
		home.form.validate.name(name);
		return;
	},
	"keyup #zipInput": function (event) {
		var zip = event.currentTarget.value;
		Session.set('zip', zip);
		Session.set('zipPerfect', home.form.validate.zip(zip));
		return;
	},
	"keyup #hobbyInput": function (event) {
		var hobby = event.currentTarget.value;
		Session.set('hobby', hobby);
		home.form.validate.hobby(hobby);
		return;
	},
	"click #lostLink": function (event) {
		bootbox.alert('No worries! Use this page to get a new link.');
		app.fail('access_link',
			['user-initiated|home.js|click #lostLink']);
	},
	"submit #begin": function (event) {
		// Don't refresh the page
		event.preventDefault();

		var username = app.transform.username(Session.get('name'));
		var zip      = app.transform.region(Session.get('zip'));
		var hobby    = app.transform.humanToUrl(Session.get('hobby'));
		var board    = zip + hobby;

		// If user wants to browse anonymously, let them
		if(!username || username === '') {
			app.logOut();
			Router.go('/region/' + zip + '/board/' + hobby);
			return false;
		}

		// Stop user if their name is taken
		Meteor.call('personExists', username, function(error, result) {
			if(result) {
				Session.set('warning_name', 'This name is taken.');
				Session.set('nameTaken', true);
				return false;	
			}
			// Otherwise, create a user for them
			var newPerson = {
				username: username,
				zip: zip
			};
			Meteor.apply('makeNewPerson', [newPerson], true,
				function(error, result) {
					Meteor.loginWithPassword(
						{id: result.user_id},
						result.password);
					Router.go('/reserve/id/' + result.user_id +
							  '/token/' + result.password +
							  '/board/' + zip +
							  '/' + hobby);
					return false;
			});
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


/*
	LOCAL NAMESPACE
*/

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
		validate: {
			name: function(name) {
				var validation = app.validate.username(name);
				Session.set('warning_name', validation.message);
				return validation.valid;
			},
			zip: function(zip) {
				if(zip.length < 3) {
					Session.set('warning_zip', '');
					return false;
				}
				var validation = app.validate.region(zip);
				Session.set('warning_zip', validation.message);
				return validation.valid;
			},
			hobby: function(hobby) {
				if(hobby.length < 1) {
					return false;
				}
				var validation = app.validate.boardName(hobby);
				Session.set('warning_hobby', validation.message);
				return validation.valid;
			}
		}
	},
	clearTrackers: function() {
		var trackers = this.trackers;
		for(var tracker = 0; tracker < trackers.length; tracker++) {
			trackers[tracker].stop();
		}
		return true;
	},
	trackSubmittability: function() {
		// Form is submittable if there are no warnings and
		//  both hobby and zip are filled
		var submittable = Tracker.autorun(function () {
			Session.set('submittable',
			   (Session.get('warning_name') === '' &&
				Session.get('warning_zip') === '' &&
				Session.get('warning_hobby') === '' &&
				Session.get('zip') !== '' &&
				Session.get('zipPerfect') &&
				Session.get('hobby') !== '')
			);
		});
		this.trackers.push(submittable);
	}
};