//Boards = new Mongo.Collection("boards");
Boards.attachSchema(new SimpleSchema({
	board: {
		type: String,
		label: "Board",
		max: 203
	},
	hobby: {
		type: String,
		label: "Hobby",
		max: 200
	},
	zip: {
		type: Number,
		label: "Zip code",
		max: 3
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