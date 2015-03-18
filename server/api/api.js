Meteor.methods({
	makeNewBoard: function(board) {
		if(board.board && board.hobby && board.zip &&
			board.board.toString().length <= 203 &&
			!board.board.toString().match(/[^\w]|_/g) &&
			board.hobby.toString().length <= 200 &&
			!board.hobby.toString().match(/[^\w]|_/g) &&
			board.zip.toString().length === 5 &&
			!board.zip.toString().match(/[^0-9]/g) ) {
				board.zip = board.zip.substring(0,3);
				Boards.insert(board);
		}
	}
});