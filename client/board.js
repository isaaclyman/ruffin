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
		var board_path = Session.get('board_path');
		Meteor.call('addBoardDescription', board_path, description);
	},
	"click #deleteBtn" : function (event) {
		if(!Session.get('board_path')) {
			Session.set('board_path', Session.get('zip') + Session.get('hobby'));
		}
		var board_path = Session.get('board_path');
		var timestamp = this.timestamp;
		Meteor.call('deleteMessage', board_path, timestamp);
	},
	"submit #newMessage" : function (event) {
		event.preventDefault();
		var message = event.currentTarget[0].value;
		Meteor.call('addMessage', Session.get('board_path'), message);
		$('#messageInput')[0].value = '';
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
		var board_path = Session.get('board_path');
		var board = Boards.findOne({ board: board_path });
		if(board) {
			return board.description;
		} else {
			return null;
		}
	},
	loggedIn: function() {
		return !!(Meteor.userId());
	},
	messages: function() {
		var messages = this.messages || false;
		if(messages) {
			for(var msg in messages) {
				// Create a readable timestamp for each message
				messages[msg].friendlyTimestamp = new Date(messages[msg].timestamp).toString().substring(0,24);
				// Determine whether each message was written by the current user
				messages[msg].mine = !!(messages[msg].user_id === Meteor.userId());
			}
		}
		return messages;
	},
	username: function() {
		// Reactively set the username, or anonymous if no one is logged in
		if(Meteor.user()) {
			return Meteor.user().username;
		} else {
			return 'Anonymous';
		}
	},
	time: function() {
		// Give the current time in hours, minutes, AM/PM
		var rightnow = Session.get('rightnow');
		var seconds = rightnow.getSeconds();
		var minutes = rightnow.getMinutes().toString().length === 1 ? '0' + rightnow.getMinutes() : rightnow.getMinutes();
		var ampm    = rightnow.getHours() <= 12 ? 'AM' : 'PM';
		var hours   = rightnow.getHours() <= 12 ? rightnow.getHours() : rightnow.getHours() - 12;
		return hours + ':' + minutes + ' ' + ampm;
	},
	date: function() {
		// (Currently unused) Get the readable current date
		var rightnow = Session.get('rightnow');
		var day     = rightnow.getDate();
		var months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var month   = months[rightnow.getMonth()];
		var year    = rightnow.getFullYear();
		return month + ' ' + day + ', ' + year;
	}
});

/*
	LOCAL NAMESPACE
*/

var board = {
	trackers:  [],
	intervals: [],
	rightnow: Date(),
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
			rightnow = Date();
		}, interval);
		this.intervals.push(clock);
	}
};