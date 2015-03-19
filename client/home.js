if(Meteor.isClient) {

// Enable tooltips, set default vars
Template.home.rendered = function() {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
	Session.setDefault({
		name: '',
		zip: '',
		hobby: ''
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
		return;
	},
	"change #nameInput": function (event) {
		Session.set('name', event.currentTarget.value);
		return;
	},
	"keypress #zipInput": function (event) {
		var zip = event.currentTarget.value;
		return;
	},
	"change #zipInput": function (event) {
		Session.set('zip', event.currentTarget.value);
		return;
	},
	"keypress #hobbyInput": function (event) {
		var hobby = event.currentTarget.value;
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
		if( !Boards.find({ board: board }) ) {
			var newBoard = {
				board: board,
				hobby: hobby,
				zip  : zip,
				description: '',  //TODO
				createdDate: null //TODO
			}
			Meteor.makeNewBoard(newBoard);
		}
		Session.set('user', name);
		Session.set('zip', zip);
		Session.set('board', hobby);
		Router.go('/zip/' + zip + '/board/' + hobby);
		return false;
	}
});

Template.home.helpers({
	warning: function() {
		return Session.get('warning');
	},
	name: function() {
		return Session.get('name');
	},
	zip: function() {
		return Session.get('zip');
	},
	hobby: function() {
		return Session.get('hobby');
	}
});

}