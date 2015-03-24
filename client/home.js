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
	"keypress #nameInput": function (event) {
		var name = event.currentTarget.value;
		if( name.length > 36 ) {
			Session.set('warning_name', 'Too long.');
		} else {
			Session.set('warning_name', '');
		}
		return;
	},
	"change #nameInput": function (event) {
		Session.set('name', event.currentTarget.value);
		return;
	},
	"keypress #zipInput": function (event) {
		var zip = event.currentTarget.value;
		if( zip.length > 5 ) {
			Session.set('warning_zip', 'Five-digit American zip codes only.');
			Session.set('zipPerfect', false);
		} else if ( !zip.match(/^[0-9]+$/) ) {
			Session.set('warning_zip', 'Numbers only.');
			Session.set('zipPerfect', false);
		} else if ( zip.match(/^[0-9]{5}$/) ) {
			Session.set('warning_zip', '');
			Session.set('zipPerfect', true);
		} else {
			Session.set('warning_zip', '');
			Session.set('zipPerfect', false);
		}
		return;
	},
	"change #zipInput": function (event) {
		Session.set('zip', event.currentTarget.value);
		return;
	},
	"keypress #hobbyInput": function (event) {
		var hobby = event.currentTarget.value;
		if( hobby.length > 200 ) {
			Session.set('warning_hobby', '200 characters maximum');
		} else {
			Session.set('warning_hobby', '');
		}
		return;
	},
	"change #hobbyInput": function (event) {
		Session.set('hobby', event.currentTarget.value);
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
		Router.go('/zip/' + zip + '/board/' + hobby);
		return false;
	}
});

var submittable = function () {
	return (Session.get('warning_name') === '' &&
			Session.get('warning_zip') === '' &&
			Session.get('warning.hobby') === '' &&
			Session.get('zip') !== '' &&
			Session.get('hobby') !== '');
};

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
	zip: function() {
		return Session.get('zip');
	},
	zipPerfect: function() {
		return Session.get('zipPerfect');
	},
	hobby: function() {
		return Session.get('hobby');
	},
	submittable: function() {
		return submittable();
	}
});