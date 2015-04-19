Template.board.rendered = function () {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
	$('#chatWindow').bind('DOMNodeInserted', function() {
		$('#chatWindow')[0].scrollTop = $('#chatWindow')[0].scrollHeight;
	});
	Meteor.setTimeout(function() {
		$('#chatWindow')[0].scrollTop = $('#chatWindow')[0].scrollHeight;
	}, 500);

	Session.setDefault('loggedIn', false);
	Session.setDefault('rightnow', new Date());

	Meteor.call('loggedIn', function(error, result) {
		Session.set('loggedIn', result);
	});
	Meteor.setInterval(function() {
		Session.set('rightnow', new Date());
	}, 20000);

	Tracker.autorun(function () {
		var board_path = Session.get('board_path');
		var board = Boards.findOne({ board: board_path });
		if(board) {
			Session.set('description', board.description);
		}
		return;
	});
};

Template.board.events({
	"click #descriptionBtn" : function (event) {
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
		return Session.get('description');
	},
	loggedIn: function() {
		return Session.get('loggedIn');
	},
	board_messages: function() {
		if(Boards.findOne({ board: Session.get('board_path') })) {
			var messages = Boards.findOne({ board: Session.get('board_path') }).messages;
			for(var msg in messages) {
				messages[msg].friendlyTimestamp = new Date(messages[msg].timestamp).toString().substring(0,24);
				messages[msg].mine = !!(messages[msg].user_id === Meteor.userId());
			}
			Session.set('board_messages', messages);
			return messages;
		}
	},
	username: function() {
		var username = Session.get('username');
		if (username[0] === '"') {
			return EJSON.parse(username);
		} else {
			return username;
		}
	},
	time: function() {
		var rightnow = Session.get('rightnow');
		var seconds = rightnow.getSeconds();
		var minutes = rightnow.getMinutes().toString().length === 1 ? '0' + rightnow.getMinutes() : rightnow.getMinutes();
		var ampm    = rightnow.getHours() <= 12 ? 'AM' : 'PM';
		var hours   = rightnow.getHours() <= 12 ? rightnow.getHours() : rightnow.getHours() - 12;
		return hours + ':' + minutes + ' ' + ampm;
	},
	date: function() {
		var rightnow = Session.get('rightnow');
		var day     = rightnow.getDate();
		var months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var month   = months[rightnow.getMonth()];
		var year    = rightnow.getFullYear();
		return month + ' ' + day + ', ' + year;
	}
});