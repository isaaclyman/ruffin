var dashboard = {};
dashboard.addHobby = function() {
	var zip = Session.get('zip'), 
		hobby = Session.get('hobby');
	// Not being able to get the hobby is a fatal error
	if(!hobby) {
		Session.set('warning_hobby', 'That didn\'t work. Please try again.');
		return false;
	}
	// Not being able to get the zip is recoverable
	if(!zip) {
		zip = Meteor.user().profile.zip;
		Session.set('zip', zip);
	}
	zip = app.transformRegion(zip);
	hobby = app.transformToUrl(hobby);
	console.log(hobby);
	Router.go('/region/' + zip + '/board/' + hobby);
};

Template.dashboard.rendered = function() {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
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
	"click #changeZip" : function(event) {
		bootbox.prompt('Please enter your new zip code.', function(result) {
			if (result === null) {
				return false;
			}
			if (!result.match(/^[0-9]{3,5}$/)) {
				bootbox.alert('This is not a valid zip code.');
				return false;
			}
			Meteor.call('changeZip', Number(result));
		});
	},
	"click .boardList" : function(event) {
		var button = event.currentTarget;
		$(button).addClass('select');
	},
	"blur .boardList" : function(event) {
		var button = event.currentTarget;
		$(button).removeClass('select');
	},
	"click .goBtn" : function (event) {
		Router.go('/region/' + this.zip + '/board/' + this.hobby);
	},
	"click .deleteBtn" : function (event) {
		Meteor.call('removeBoardFromPerson', this.board_path);
	},
	"keyup #boardInput": function (event) {
		// Submit if enter key
		if(event.which === 13 && Session.get('hobby')) {
			dashboard.addHobby();
		}
		// Immediate validation
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
	zip: function() {
		if(!Meteor.user()) {
			return '###';
		} else {
			return Meteor.user().profile.zip;
		}
	},
	boards: function() {
		if(Meteor.user()) {
			var userBoards = Meteor.user().profile.boards;
			var displayBoards = [];
			for(var board in userBoards) {
				var zip = userBoards[board].substring(0,3);
				var hobby = userBoards[board].substring(3);
				var board_path = zip + hobby;
				displayBoards.push({
					hobby: hobby, 
					zip: zip, 
					board_path: board_path
				});
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