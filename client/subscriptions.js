/*
	ALLOW
*/

// This is here for reactive optimization; needs extended implementation

// Allow boards to be created
Boards.allow({
	'insert' : function(board) {
		if( !Boards.find({ board: board }) ) {
			return true;
		} else {
			return false;
		}
	}
});