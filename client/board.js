Meteor.startup(function() {
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
		Meteor.call('addBoardDescription', !!boardID, description); //TODO
	}
});

Template.board.helpers({ 
	board: function() {
		var originalBoard = Session.get('board');
		return originalBoard.charAt(0).toUpperCase() + 
				originalBoard.slice(1);
	},
	username: function() {
		var originalName = Session.get('username');
		return originalName.charAt(0).toUpperCase() + 
				originalName.slice(1);
	},
	time: function() {
		var rightnow = Session.get('rightnow');
		var seconds = rightnow.getSeconds();
		var minutes = rightnow.getMinutes();
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