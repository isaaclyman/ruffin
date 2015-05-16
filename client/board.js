Template.board.rendered = function () {
	app.turnOnTooltips();

	board.initialize();
	
	board.scrollToBottomImmediately();

	board.onChatScrollToBottom();

	board.startClock(20000);

	board.data = this.data;
};

Template.board.onDestroyed(function () {
	board.clearIntervals();
});

Template.board.events({
	"click #menuBtn" : function () {
		Router.go('/');
	},
	"submit #newDescription" : function () {
		event.preventDefault();
		board.form.description.submit(this.board);
	},
	"click #descriptionBtn" : function () {
		board.form.description.submit(this.board);
	},
	"click #deleteBtn" : function () {
		// lexical scope is the message object
		var timestamp = this.timestamp;
		var id = this._id;
		Meteor.call('deleteMessage', board.data.board, id, timestamp);
	},
	"submit #newMessage" : function () {
		event.preventDefault();
		board.form.message.submit(this.board);
	},
	"click #messageBtn" : function () {
		board.form.message.submit(this.board);
	},
	"click #showFormCard" : function () {
		board.toggle('form_card');
	},
	"click #showFormEvent" : function() {
		board.toggle('form_event');
	},
	"click #submitCard" : function() {
		for(var card = 0; card < this.cards.length; card++) {
			if(this.cards[card].user_id === Meteor.userId()) {
				return false;
			}
		}
		var availability = $('#availabilityInput')[0].value;
		var allow_email  = $('#allowEmailCheckbox')[0].checked;
		Meteor.call('addCardToBoard', this.board, availability, allow_email);
		Session.set('form_card', false);
	},
	"click .talkBtn" : function(event) {
		board.flipCard(event.target);
	},
	"keyup #pMessageInput" : function(event) {
		if(event.which === 13) {
			board.form.pMessage.send(board.data.board, this.user_id);
			board.flipCard(event.target);
		}
	},
	"click #pMessageSend" : function(event) {
		board.form.pMessage.send(board.data.board, this.user_id);
		board.flipCard(event.target);
	}
});

Template.board.helpers({ 
	title: function() {
		return "Ruffin|" + this.hobby;
	},
	board: function() {
		return this.hobby;
	},
	zip: function() {
		return this.zip;
	},
	loggedIn: function() {
		return !!(Meteor.userId());
	},
	description: function() {
		return this.description;
	},
	messages: function() {
		if(!this.messages) {
			return [];
		}
		var messages = this.messages;
		for(var msg in messages) {
			// Create a readable timestamp for each message
			messages[msg].friendlyTimestamp =
				app.transform.toFriendlyDateTime(messages[msg].timestamp);
			// Determine whether each message was written by the current user
			messages[msg].mine = board.validate.isMine(messages[msg]);
		}
		return messages;
	},
	username: function() {
		// Reactively set the username
		if(Meteor.user()) {
			return Meteor.user().username;
		} else {
			return 'Anonymous';
		}
	},
	time: function() {
		return app.transform.toFriendlyTime(board.rightnow);
	},
	cards: function() {
		return this.cards;
	},
	events: function() {
		return this.events;
	},
	form_card: function() {
		return Session.get('form_card');
	},
	form_event: function() {
		return Session.get('form_event');
	},
	userHasCardHere: function() {
		if(!this.cards) {
			return false;
		}
		for(var card = 0; card < this.cards.length; card++) {
			if(this.cards[card].user_id === Meteor.userId()) {
				return true;
			}
		}
		return false;
	}
});

/*
	LOCAL NAMESPACE
*/

var board = {
	trackers:  [],
	intervals: [],
	data: {},
	rightnow: new Date(),
	initialize: function() {
		Session.set({
			form_card : false,
			form_event: false
		});
	},
	clearIntervals: function() {
		var intervals = this.intervals;
		for(var interval = 0; interval < intervals.length; interval++) {
			Meteor.clearInterval(intervals[interval]);
		}
		return true;
	},
	onChatScrollToBottom: function() {
		$('#chatWindow').bind('DOMNodeInserted', function() {
			$('#chatWindow')[0].scrollTop = $('#chatWindow')[0].scrollHeight;
		});
	},
	scrollToBottomImmediately: function() {
		Meteor.setTimeout(function() {
			if($('#chatWindow').length) {
				$('#chatWindow')[0].scrollTop = $('#chatWindow')[0].scrollHeight;
			}
		}, 600);
	},
	startClock: function(interval) {
		var rightnow = this.rightnow;
		var clock = Meteor.setInterval(function() {
			rightnow = new Date();
		}, interval);
		this.intervals.push(clock);
	},
	toggle: function(form) {
		if(form === 'form_card') {
			Session.set('form_card', !Session.get('form_card'));
			Session.set('form_event', false);
			return;
		}
		if(form === 'form_event') {
			Session.set('form_event', !Session.get('form_event'));
			Session.set('form_card', false);
			Meteor.setTimeout(function() {
				$('#dateInput').datetimepicker();
			}, 500);
			return;
		}
	},
	flipCard: function(buttonElement) {
		$(buttonElement.parentElement.parentElement.parentElement).toggleClass('flipped');
		return;
	},
	validate: {
		description: function(description) {
			var validation = app.validate.boardDescription(description);
			return validation.valid;
		},
		isMine: function(message) {
			return !!(message.user_id === Meteor.userId());
		}
	},
	form: {
		description: {
			submit: function(board) {
				var description = $('#descriptionInput')[0].value;
				Meteor.call('addBoardDescription', board, description);
			}
		},
		message: {
			submit: function(board) {
				var message = $('#messageInput')[0].value;
				Meteor.call('addMessage', board, message);
				$('#messageInput')[0].value = '';
			}
		},
		pMessage: {
			send: function(board, toUser) {
				var pMessage = $('#pMessageInput')[0].value;
				Meteor.call('pMessageSend', board, toUser, pMessage);
				$('#pMessageInput')[0].value = '';
			}
		}
	}
};