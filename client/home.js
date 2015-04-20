var home = {};
home.trackers = [];

// Enable tooltips, set default vars
Template.home.rendered = function() {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
	Session.setDefault({
		name: '',
		zip: '',
		hobby: '',
		warning_name: '',
		warning_zip: '',
		zipPerfect: false,
		warning_hobby: ''
	});
	Session.set('nameTaken', false);

	var submitTracker = Tracker.autorun(function () {
		var sub = (Session.get('warning_name') === '' &&
				   Session.get('warning_zip') === '' &&
				   Session.get('warning_hobby') === '' &&
				   Session.get('zip') !== '' &&
				   Session.get('zipPerfect') &&
				   Session.get('hobby') !== '');
		Session.set('submittable', sub);
	});
	home.trackers.push(submitTracker);
};

Template.home.onDestroyed(function() {
	for(var trk in home.trackers) {
		home.trackers[trk].stop();
	}
});

Template.home.events({
	"keyup #nameInput": function (event) {
		var name = event.currentTarget.value;
		if( name.length > 36 ) {
			Session.set('warning_name', 'This name is too long.');
		} else {
			Session.set('warning_name', '');
		}
		Session.set('name', name);
		return;
	},
	"keyup #zipInput": function (event) {
		var zip = event.currentTarget.value;
		if( zip.length > 5 && zip.match(/^[0-9]+$/) ) {
			Session.set('warning_zip', 'Five-digit zip codes only.');
			Session.set('zipPerfect', false);
		} else if ( zip.length > 0 && !zip.match(/^[0-9]+$/) ) {
			Session.set('warning_zip', 'Only numbers are allowed.');
			Session.set('zipPerfect', false);
		} else if ( zip.match(/^[0-9]{5}$/) ) {
			Session.set('warning_zip', '');
			Session.set('zipPerfect', true);
		} else {
			Session.set('warning_zip', '');
			Session.set('zipPerfect', false);
		}
		Session.set('zip', zip);
		return;
	},
	"keyup #hobbyInput": function (event) {
		var hobby = event.currentTarget.value;
		if( hobby.length > 200 ) {
			Session.set('warning_hobby', 'This hobby is too long.');
		} else {
			Session.set('warning_hobby', '');
		}
		Session.set('hobby', hobby);
		return;
	},
	"click #lostLink": function (event) {
		bootbox.alert('No worries! Use this page to get a new link.');
		Router.go('/failure/reason/access_link');
	},
	"submit #begin": function (event) {
		var username  = event.target[0].value.toString().toLowerCase().trim();
		var zip   = parseInt(event.target[1].value.toString().substring(0,3));
		var hobby = event.target[2].value
					.toString()
					.trim()
					.toLowerCase()
					.replace(/ /g, '_')
					.replace(/[^\w_]/g, '');
		var board = zip + hobby;
		
		// Don't do a page refresh...don't do it...
		event.preventDefault();

		// If user wants to browse anonymously, let it happen
		if(!username || username === '') {
			Meteor.logout();
			Meteor.apply('logOut', [], true);
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
		var loginNeeded = true;
		Meteor.apply('alreadyLoggedIn', [username], true, function(error, result) {
			if(result) {
				Session.setPersistent('zip', zip);
				Session.setPersistent('hobby', hobby);
				Session.setPersistent('board', board);
				Router.go('/region/' + zip + '/board/' + hobby);
				loginNeeded = false;
				return false;
			}
		});

		if(!loginNeeded) {
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