//Message is a property of Boards
Message = new SimpleSchema({
	user: {
		type: String,
		label: "User"
	},
	name: {
		type: String,
		label: "Name",
		max: 36
	},
	text: {
		type: String,
		label: "Text"
	},
	edited: {
		type: Boolean,
		label: "Edited"
 	},
	timestamp: {
		type: Date,
		label: "Timestamp"
	}
});

//Boards = new Mongo.Collection("boards");
Boards.attachSchema(new SimpleSchema({
	board: {
		type: String,
		label: "Board",
		regEx: /^[a-zA-Z0-9_]+$/,
		min: 4,
		max: 203
	},
	hobby: {
		type: String,
		label: "Hobby",
		regEx: /^[a-zA-Z0-9_]+$/,
		min: 1,
		max: 200
	},
	zip: {
		type: Number,
		label: "Zip code",
		regEx: /^[0-9]{3}$/,
		min: 000,
		max: 999
	},
	description: {
		type: String,
		label: "Description",
		max: 140,
		optional: true
	},
	described_by: {
		type: String,
		label: "Description",
		optional: true
	},
	tags: {
		type: [String],
		label: "Tags",
		max: 36,
		optional: true
	},
	messages: {
		type: [Message],
		label: "Messages",
		optional: true
	},
	createdDate: {
		type: Date,
		label: "Created on"
	}
}));