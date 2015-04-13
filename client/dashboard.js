Template.dashboard.rendered = function() {
	if(!Meteor.userId()) {
		Router.go('/failure');
	}
	Session.setDefault('username', '...');
};

Tracker.autorun(function () {
	var user = Meteor.user();
	if(user) {
		if(Session.get('username') !== user.username) {
			Router.go('/failure');
		} else {
			Session.setPersistent('username', user.username);
		}
	}
});

Template.dashboard.events({
	"click .boardList" : function(event) {
		var board = unscramble(event.currentTarget.innerText);
		Router.go('/region/' + board.zip + '/board/' + board.hobby);
	}
});

Template.dashboard.helpers({
	title: function() {
		if(Meteor.user()) {
			return 'Ruffin|' + Meteor.user().username;
		} else {
			return 'Ruffin|dashboard';
		}
	},
	username: function() {
		return Session.get('username');
	},
	boards: function() {
		if(Meteor.user()) {
			var userBoards = Meteor.user().profile.boards;
			var displayBoards = [];
			for(var board in userBoards) {
				var zip = userBoards[board].substring(0,3);
				var hobby = userBoards[board].substring(3);
				displayBoards.push({hobby: hobby, zip: zip});
			}
			return displayBoards;
		}
	}
});

/*
	AUXILIARY FUNCTIONS
*/
var unscramble = function(displayBoard) {
	var zipStart = displayBoard.lastIndexOf('(');
	var hobby = displayBoard.substring(0, (zipStart - 1)).toLowerCase();
	var zip   = displayBoard.substring(zipStart + 1, zipStart + 4);
	return {
			hobby: hobby, 
			zip: zip, 
			board_path: zip + hobby
		   };
};