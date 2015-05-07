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
		Meteor.call('deleteMessage', this.board, id, timestamp);
	},
	"submit #newMessage" : function () {
		event.preventDefault();
		board.form.message.submit(this.board);
	},
	"click #messageBtn" : function () {
		board.form.message.submit(this.board);
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
	description: function() {
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
		return app.transform.toFriendlyTime(board.rightnow);
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
		}
	}
};