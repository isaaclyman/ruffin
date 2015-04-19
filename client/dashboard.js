var dashboard = {};
dashboard.addHobby = function() {
	if(!Session.get('zip')) {
		Session.set('zip', Meteor.user().profile.zip);
	}
	if(Session.get('hobby')) {
		Router.go('/region/' + Session.get('zip') + '/board/' + Session.get('hobby'));
	} else {
		Session.set('warning_hobby', 'That didn\'t work. Please try again.');
	}
};
dashboard.unscramble = function(displayBoard) {
	var zipStart = displayBoard.lastIndexOf('(');
	var hobby = displayBoard.substring(0, (zipStart - 1)).toLowerCase();
	var zip   = displayBoard.substring(zipStart + 1, zipStart + 4);
	return {
			hobby: hobby, 
			zip: zip, 
			board_path: zip + hobby
		   };
};

Template.dashboard.rendered = function() {
	if(!Meteor.userId()) {
		Router.go('/failure');
	}
	Session.setDefault('username', '...');
	Session.set({
		'warning_hobby': '',
		'hobby': ''
	});
};

Template.dashboard.events({
	"click .boardList" : function(event) {
		var board = dashboard.unscramble(event.currentTarget.innerText);
		Router.go('/region/' + board.zip + '/board/' + board.hobby);
	},
	"keyup #boardInput": function (event) {
		if(event.which === 13 && Session.get('hobby')) {
			dashboard.addHobby();
		}
		var hobby = event.currentTarget.value;
		if( hobby.length > 200 ) {
			Session.set('warning_hobby', 'This hobby is too long.');
		} else {
			Session.set('warning_hobby', '');
		}
		Session.set('hobby', hobby);
		return;
	},
	"click #addButton": function (event) {
		dashboard.addHobby();
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
		if(!Meteor.user()) {
			return ' ';
		} else {
			Session.set('username', Meteor.user().username);
		}
		var username = Session.get('username');
		if(username[0] === '"') {
			return EJSON.parse(username);
		} else {
			return username;
		}
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
	},
	hobbyPerfect: function() {
		return !(Session.get('hobby') !== '' &&
			   Session.get('warning_hobby') === '') ?
				{'disabled': true} :
				{};
	},
	warning_hobby: function() {
		return Session.get('warning_hobby');
	}
});