/*
	ALLOW
*/

// VALIDATION IS HANLDED SERVER-SIDE
// This is here for reactive optimization

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