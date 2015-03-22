//Boards = new Mongo.Collection("boards");
Boards.attachSchema(new SimpleSchema({
	board: {
		type: String,
		label: "Board",
		regEx: /^[a-zA-Z0-9]+$/,
		min: 4,
		max: 203
	},
	hobby: {
		type: String,
		label: "Hobby",
		regEx: /^[a-zA-Z0-9]+$/,
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
		max: 140
	},
	createdDate: {
		type: Date,
		label: "Created on"
	}
}));