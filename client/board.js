Meteor.startup(function() {
	Session.set('rightnow', new Date());
	setInterval(function() {
		Session.set('rightnow', new Date());
	}, 20000);
});

Template.board.rendered = function () {
	$('[data-toggle="tooltip"]').tooltip({'placement': 'top'});
};

Template.board.events({
	"click #descriptionBtn" : function (event) {
		var description = $('#descriptionInput').value;
		Meteor.call('addBoardDescription', Session.get('board_path'), description);
	}
});

Template.board.helpers({ 
	title: function() {
		return "Ruffin|" + Session.get('hobby');
	},
	board: function() {
		return Session.get('hobby');
	},
	description: function() {
		return false;
	},
	username: function() {
		return Session.get('username');
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