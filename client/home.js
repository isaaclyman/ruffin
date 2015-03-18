if(Meteor.isClient) {

// Enable tooltips
Template.home.rendered = function() {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
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
		return;
	},
	"keypress #zipInput": function (event) {
		return;
	},
	"keypress #hobbyInput": function (event) {

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

}