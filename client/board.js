Template.board.rendered = function () {
	app.turnOnTooltips();
	
	board.scrollToBottomImmediately();

	board.onChatScrollToBottom();

	board.startClock(20000);
};

Template.board.onDestroyed(function () {
	board.clearIntervals();
});

Template.board.events({
	"submit #newDescription" : function (event) {
		event.preventDefault();
		var description = $('#descriptionInput')[0].value;
		Meteor.call('addBoardDescription', board.data.board, description);
	},
	"click #deleteBtn" : function (event) {
		// lexical scope is the message object
		var timestamp = this.timestamp;
		var id = this._id;
		Meteor.call('deleteMessage', board.data.board, id, timestamp);
	},
	"submit #newMessage" : function (event) {
		event.preventDefault();
		var message = event.currentTarget[0].value;
		Meteor.call('addMessage', board.data.board, message);
		event.currentTarget[0].value = '';
	}
});

Template.board.helpers({ 
	title: function() {
		return "Ruffin|" + Session.get('hobby');
	},
	board: function() {
		return Session.get('hobby');
	},
	zip: function() {
		return Session.get('zip');
	},
	description: function() {
		if(!this.description) {
			return '';
		}
		board.data.board = this.description;
		return this.description;
	},
	loggedIn: function() {
		return !!(Meteor.userId());
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
		return app.transform.toFriendlyTime(Session.get('rightnow'));
	}
});

/*
	LOCAL NAMESPACE
*/

var board = {
	trackers:  [],
	intervals: [],
	rightnow: new Date(),
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
			$('#chatWindow')[0].scrollTop = $('#chatWindow')[0].scrollHeight;
		}, 500);
	},
	startClock: function(interval) {
		var rightnow = this.rightnow;
		var clock = Meteor.setInterval(function() {
			rightnow = new Date();
		}, interval);
		this.intervals.push(clock);
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
	data: {
		board: null
	}
};