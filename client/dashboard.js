Template.dashboard.rendered = function() {
	app.turnOnTooltips();
	if(!Meteor.userId()) {
		app.fail('no_login', [Meteor.userId()]);
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
			if(!dashboard.validate.region(result)) {
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
			return;
		}
		var hobby = event.currentTarget.value;
		if(!dashboard.validate.hobby(hobby)) {
			return;
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
		}
		dashboard.data.username = Meteor.user().username;
		return app.transform.maybeEjson(dashboard.data.username);
	},
	zip: function() {
		if(!Meteor.user()) {
			return '###';
		}
		return Meteor.user().profile.zip;
	},
	boards: function() {
		if(Meteor.user()) {
			dashboard.data.userBoards = Meteor.user().profile.boards;
			var displayBoards = [];
			for(var board in dashboard.data.userBoards) {
				displayBoards.push({
					zip: userBoards[board].substring(0,3),
					hobby: userBoards[board].substring(3),
					board_path: this.zip + this.hobby
				});
			}
			return displayBoards;
		}
		return [];
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

/*
	LOCAL NAMESPACE
*/

var dashboard = {
	addHobby: function() {
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
		Router.go('/region/' + zip + '/board/' + hobby);
	},
	data: {
		username: '',
		userBoards: []
	},
	validate: {
		region: function(region) {
			var validation = app.validate.region(region);
			if(!validation.valid) {
				bootbox.alert('This is not a valid zip code.');
			}
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
};