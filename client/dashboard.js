Template.dashboard.rendered = function() {
	app.turnOnTooltips();

	dashboard.initialize();

	if(!Meteor.userId()) {
		app.fail('no_login', [Meteor.userId()]);
	}
};

Template.dashboard.events({
	/*
		MENU
	*/
	"click #logOut" : function() {
		if(!Meteor.user().emails || !Meteor.user().emails[0].verified) {
			bootbox.confirm('If you log out, your user name will be given away. Is that okay?', function(result) {
				if(result !== false) {
					Meteor.logout(function() {
						Router.go('/');
					});
				}
			});
		} else {
			Meteor.logout(function() {
				Router.go('/');
			});
		}
	},
	"click .tab" : function(event) {
		dashboard.switchTab(this.id, event.currentTarget);
	},
	/*
		BOARDS
	*/
	"click .boardList" : function(event) {
		var button = event.currentTarget;
		$(button).addClass('select');
	},
	"blur .boardList" : function(event) {
		var button = event.currentTarget;
		$(button).removeClass('select');
	},
	"click .goBtn" : function () {
		Router.go('/region/' + this.zip + '/board/' + this.hobby);
	},
	"click .deleteBtn" : function () {
		Meteor.call('removeBoardFromPerson', this.board);
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
	"click #addButton": function () {
		dashboard.addHobby();
	},
	/*
		MESSAGES
	*/
	"click .toggleReplies": function () {
		$('#replies-' + this._id).toggleClass('hidden');
	},
	"click .deleteMessage": function () {
		Meteor.call('pMessageDelete', this._id);
	},
	"click .replyMessage": function () {
		$('#replyForm-' + this._id).toggleClass('show');
	},
	"click .submitMessageReply": function () {
		var id     = this._id;
		var toUser = this.from_id !== Meteor.userId() ? this.from_id : this.to_id;
		var text   = $('#pMessageReply-' + this._id)[0].value;
		if (!text.length) {
			return;
		}
		Meteor.call('pMessageReply', id, toUser, text);
		$('#pMessageReply-' + this._id)[0].value = '';
		$('#replyForm-' + this._id).removeClass('show');
	},
	/*
		PROFILE
	*/
	"click #changeZip" : function() {
		$('#zipForm').first().toggleClass('show');
	},
	"keyup #zipInput" : function(event) {
		var zip = event.currentTarget.value;
		if(dashboard.validate.region(zip) && event.which == 13) {
			dashboard.change.region(zip);
		}
	},
	"click #zipBtn" : function() {
		var zip = $('#zipInput')[0].value;
		dashboard.change.region(zip);
	},
	"click #changeEmail, click #giveEmail" : function() {
		$('#emailForm').first().toggleClass('show');
	},
	"keyup #emailInput" : function(event) {
		var email = event.currentTarget.value;
		if(dashboard.validate.email(email) && event.which === 13) {
			dashboard.change.email(email);
		}
	},
	"click #emailBtn" : function() {
		var email = $('#emailInput')[0].value;
		dashboard.change.email(email);
	},
	"click #removeEmail": function() {
		bootbox.confirm('This will delete your email address from our records. Are you sure you want to do this?', function(result) {
			if(result === true) {
				Meteor.call('removeEmail');
			}
		});
	},
	"click #newVerifyLink": function() {
		if(Meteor.user()) {
			dashboard.change.email(Meteor.user().emails[0].address);		
		}
	},
	"click #newAccessLink": function() {
		if(Meteor.user()) {
			Meteor.call('resendLogin', window.location.host, Meteor.user().username);
		}
	},
	"click #destroyAllMessages": function () {
		bootbox.prompt('Are you sure? If you want to delete all messages you have written ' +
					   'on every board, please type "DELETE ALL" in the box below.',
			function(result) {
				if(result === 'DELETE ALL') {
					Meteor.call('deleteAllUserMessages', result, function(error, result) {
						bootbox.alert('All messages destroyed.');
					});
				} else {
					bootbox.alert('Destruction averted. Your messages have been left untouched.');
				}
		});
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
	tabs: function() {
		return dashboard.tabs;
	},
	tab_profile : function() { return Session.get('activeTab') === 'tab_profile'; },
	tab_boards  : function() { return Session.get('activeTab') === 'tab_boards'; },
	tab_help    : function() { return Session.get('activeTab') === 'tab_help'; },
	tab_events  : function() { return Session.get('activeTab') === 'tab_events'; },
	tab_messages: function() { return Session.get('activeTab') === 'tab_messages'; },
	userHasEmail: function() {
		if(!Meteor.user() || !Meteor.user().emails) {
			return false;
		}
		return true;
	},
	email: function() {
		if(!Meteor.user()) {
			return '';
		}
		return Meteor.user().emails[0].address;
	},
	emailVerified: function() {
		if(!Meteor.user() || !Meteor.user().emails || !Meteor.user().emails[0].verified) {
			return false;
		}
		return true;
	},
	emailValid: function() {
		return !Session.get('emailValid') ? {'disabled': true} : null;
	},
	zip: function() {
		if(!Meteor.user()) {
			return '###';
		}
		return Meteor.user().profile.zip;
	},
	zipValid: function() {
		return !Session.get('zipValid') ? {'disabled': true} : null;
	},
	boards: function() {
		if(Meteor.user()) {
			dashboard.data.userBoards = Meteor.user().profile.boards;
			
			return dashboard.data.userBoards.map(function(board) {
				return {
					zip:   board.substring(0,3),
					hobby: board.substring(3),
					board: board
				};
			});
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
	},
	howManyContactCards: function() {
		if(Meteor.user()) {
			return Meteor.user().profile.cards.length;
		}
		return false;
	},
	board_s: function(howMany) {
		return howMany === 1 ? 'board' : 'boards';
	},
	userCardBoards: function() {
		if(Meteor.user()) {
			return Meteor.user().profile.cards.map(function(card) {
				return dashboard.splitBoardPath(card);
			});
		}
		return false;
	},
	userMessages: function() {
		if(Meteor.user()) {
			var messages = {};
			var messageList = [];
			Meteor.user().profile.messages.forEach(function (msg) {
				messages[msg._id] = msg;
			});
			for(var key in messages) {
				messages[key].timestamp = app.transform.toFriendlyDateTime(messages[key].date);
				var splitBoardPath = dashboard.splitBoardPath(messages[key].board);
				messages[key].board = splitBoardPath.hobby + ' (' + splitBoardPath.zip + ')'; 

				if (messages[key].replies && messages[key].replies.length) {
					messages[key].replies.forEach(function (reply) {
						reply.timestamp = app.transform.toFriendlyDateTime(reply.date);
					});
				}
				messageList.push(messages[key]);
			}
			return messageList.sort(function (first, second) {
				return second.date - first.date;
			});
		}
		return false;
	},
	showReplies: function(message) {
		console.log(message);
		if (message.showReplies) {
			return true;
		}
		return false;
	}
});

/*
	LOCAL NAMESPACE
*/

var dashboard = {
	data: {
		username: '',
		userBoards: []
	},
	tabs: [{
		name: 'Boards',
		id: 'tab_boards'
	},{
		name: 'Events',
		id: 'tab_events'
	},{
		name: 'Messages',
		id: 'tab_messages'
	},{
		name: 'Profile',
		id: 'tab_profile'
	},{
		name: 'Help',
		id: 'tab_help'
	}],
	validate: {
		hobby: function(hobby) {
			if(hobby.length < 1) {
				return false;
			}
			var validation = app.validate.boardName(hobby);
			Session.set('warning_hobby', validation.message);
			return validation.valid;
		},
		region: function(region) {
			var validation = app.validate.region(region);
			Session.set('zipValid', validation.valid);
			return validation.valid;
		},
		email: function(email) {
			var validation = app.validate.email(email);
			Session.set('emailValid', validation.valid);
			return validation.valid;
		}
	},
	change: {
		region: function(region) {
			region = app.transform.region(region);
			Meteor.call('changeZip', region);
			$('#zipInput')[0].value = '';
			$('#zipForm').first().removeClass('show');
		},
		email: function(email) {
			Meteor.call('verifyThisEmail', email);
			bootbox.alert('Great! We\'re emailing you now to verify this address.');
			$('#emailInput')[0].value = '';
			$('#emailForm').first().removeClass('show');
		}
	},
	initialize: function() {
		Session.set('activeTab', this.tabs[0].id);
		$('.tab').first().addClass('active');

		Session.setDefault('username', '...');
		Session.set({
			'warning_hobby': '',
			'hobby': '',
			'zipValid': false,
			'emailValid': false
		});
	},
	switchTab: function(tabId, target) {
		$('.tab').removeClass('active');
		$(target).addClass('active');
		Session.set('activeTab', tabId);
		Meteor.setTimeout(function () {
			app.turnOnTooltips();
		}, 500);
	},
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
		zip = app.transform.region(zip);
		hobby = app.transform.humanToUrl(hobby);
		Router.go('/region/' + zip + '/board/' + hobby);
	},
	splitBoardPath: function(board_path) {
		return {
			zip  : board_path.substring(0,3),
			hobby: board_path.substring(3)
		};
	}
};
