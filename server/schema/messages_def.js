//Messages = new Mongo.Collection("messages");
Messages.attachSchema(new SimpleSchema({
	board: {
		type: String,
		label: "Board"
	},
	user: {
		type: String,
		label: "User"
	},
	text: {
		type: String,
		label: "Text"
	},
	timestamp: {
		type: String,
		label: "Timestamp"
	}
}));