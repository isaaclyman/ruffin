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
};

// Set page title dynamically
Handlebars.registerHelper("setTitle", function(title) {
	if(title) {
		document.title = title;
	} else {
		document.title = "Ruffin";
	}
})

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
	"submit #begin": function (event) {
		var name  = event.target[0].value.toString();
		var zip   = event.target[1].value.toString().substring(0,3);
		var hobby = event.target[2].value
					.toString()
					.trim()
					.toLowerCase()
					.replace(/[^\w]|_/g, '');
		var board = zip + hobby;
		
		// Stop user if their name is taken
		if( Meteor.call('personExists', name)) {
			Session.set('warning_name', 'This name is taken.');
			console.log('person taken');
			return false;
		} else {
			var user_id = Meteor.call('makeNewPerson', name, zip, hobby);
			Session.set('user_id', user_id);
			console.log('user_id|', user_id);
		}

		// Create board if it doesn't exist
		if( !Meteor.call('boardExists', board) ) {
			var newBoard = {
				board: board,
				hobby: hobby,
				zip  : zip
			}
			Session.set('board_id', Meteor.call('makeNewBoard', newBoard));
		} else {
			Session.set('board_id', Meteor.call('boardExists', board));
		}
		
		Session.set('user', name);
		Session.set('zip', zip);
		Session.set('board', hobby);
		Router.go('/region/' + zip + '/board/' + hobby);
		return false;
	}
});

Tracker.autorun(function () {
	var sub = (Session.get('warning_name') === '' &&
			   Session.get('warning_zip') === '' &&
			   Session.get('warning_hobby') === '' &&
			   Session.get('zip') !== '' &&
			   Session.get('zipPerfect') &&
			   Session.get('hobby') !== '');
	Session.set('submittable', sub);
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
		return Session.get('name') !== '' && 
			   Session.get('warning_name') === '';
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
	}
});