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
	'click #menuBtn' : function () {
		Router.go('/');
	},
	'submit #newDescription' : function () {
		event.preventDefault();
		board.form.description.submit(this.board);
	},
	'click #descriptionBtn' : function () {
		board.form.description.submit(this.board);
	},
	'click #deleteBtn' : function () {
		// lexical scope is the message object
		var timestamp = this.timestamp;
		var id = this._id;
		Meteor.call('deleteMessage', board.data.board, id, timestamp);
	},
	'submit #newMessage' : function () {
		event.preventDefault();
		board.form.message.submit(this.board);
	},
	'click #messageBtn' : function () {
		board.form.message.submit(this.board);
	},
	'click #showFormCard' : function () {
		board.toggle('form_card');
	},
	'click #showFormEvent' : function() {
		board.toggle('form_event');
	},
	'click #submitCard' : function() {
		// Don't allow a user to submit a card twice
		if(this.cards && this.cards.length) {
			var userIds = this.cards.map(function(card) {
				return card.user_id;
			});
			if (userIds.indexOf(Meteor.userId()) !== -1) {
				return false;
			}
		}

		var availability = $('#availabilityInput')[0].value;
		var allow_email  = $('#allowEmailCheckbox')[0].checked;
		Meteor.call('addCardToBoard', this.board, availability, allow_email);
		Session.set('form_card', false);
	},
	'click .talkBtn' : function(event) {
		board.flipCard(event.target);
	},
	'click .deleteCard' : function() {
		Meteor.call('removeUserCard', board.data.board);
	},
	'keyup #pMessageInput' : function(event) {
		if(event.which === 13) {
			board.form.pMessage.send(board.data.board, this.user_id);
			board.flipCard(event.target);
		}
	},
	'click #pMessageSend' : function(event) {
		board.form.pMessage.send(board.data.board, this.user_id);
		board.flipCard(event.target);
	},
	'keyup #titleInput' : function(event) {
		var title = event.target.value;
		board.validate.title(title);
	},
	'change #dateInput' : function(event) {
		var date = event.target.value;
		board.validate.date(date);
	},
	'keyup #locationInput' : function(event) {
		var location = event.target.value;
		board.validate.location(location);
	},
	'keyup #descriptionInput' : function(event) {
		var description = event.target.value;
		board.validate.description(description);
	},
	'click #submitEvent' : function() {
		var title = $('#titleInput')[0].value;
		var date  = $('#dateInput')[0].value;
		var location = $('#locationInput')[0].value;
		var description = $('#descriptionInput')[0].value;
		Meteor.call('addEventToBoard', this.board, title, Date.parse(date), location, description);
		board.toggle('form_event');
	}
});

Template.board.helpers({ 
	title: function() {
		return 'Ruffin|' + this.hobby;
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
		return messages.map(function(msg) {
			msg.friendlyTimestamp =
				app.transform.toFriendlyDateTime(msg.timestamp);
			msg.mine = board.validate.isMine(msg);
			return msg;
		});
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
		// If this user has a card here, put it at the beginning for easy access
		if (this.cards && this.cards.length) {
			var userIds = this.cards.map(function(card) {
				return card.user_id;
			});
			var myCardIndex = userIds.indexOf(Meteor.userId());
			if (myCardIndex !== -1) {
				var myCard = this.cards[myCardIndex];
				myCard.mine = true;
				this.cards.splice(myCardIndex, 1);
				this.cards.unshift(myCard);
			}
		}
		app.turnOnTooltips();
		return this.cards || [];
	},
	events: function() {
		// If this user has events here, put them at the beginning for easy access
		var events = this.events;
		if (events && events.length) {
			var hostIds = events.map(function(event) {
				return event.host;
			});
			hostIds.filter(function (host) {
				return host === Meteor.userId();
			}).forEach(function () {
				var myEventIndex = hostIds.lastIndexOf(Meteor.userId());
				var myEvent = events[myEventIndex];
				events.splice(myEventIndex, 1);
				events.unshift(myEvent);
			});
		}
		return events || [];
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
		var userIds = this.cards.map(function(card) {
			return card.user_id;
		});
		if (userIds.indexOf(Meteor.userId()) !== -1) {
			return true;
		}
		return false;
	},
	disableTalk: function(mine) {
		return mine ? {disabled: true} : null;
	},
	warning_title: function() {
		return Session.get('warning_title');
	},
	warning_date: function() {
		return Session.get('warning_date');
	},
	warning_location: function() {
		return Session.get('warning_location');
	},
	warning_description: function() {
		return Session.get('warning_description');
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
			form_event: false,
			warning_title: '',
			warning_date: '',
			warning_location: '',
			warning_description: ''
		});
	},
	clearIntervals: function() {
		this.intervals.forEach(function(interval) {
			Meteor.clearInterval(interval);
		});
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
		},
		title: function(title) {
			var validation = app.validate.char140(title);
			Session.set('warning_title', validation.message);
			return validation.valid;
		},
		date: function(date) {
			var validation = app.validate.humanDate(date);
			Session.set('warning_date', validation.message);
			return validation.valid;
		},
		location: function(location) {
			var validation = app.validate.char1000(location);
			Session.set('warning_location', validation.message);
			return validation.valid;
		},
		description: function(description) {
			var validation = app.validate.char1000(description);
			Session.set('warning_description', validation.message);
			return validation.valid;
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
				var pMessage = $('#card-' + toUser + ' #pMessageInput')[0].value;
				Meteor.call('pMessageSend', board, toUser, pMessage);
				$('#pMessageInput')[0].value = '';
			}
		}
	}
};
