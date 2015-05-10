//Message is a property of Boards
MessagePattern = new SimpleSchema({
	_id: {
		type: String
	},
	user_id: {
		type: String
	},
	name: {
		type: String,
		label: "Name",
		max: 36
	},
	text: {
		type: String,
		label: "Text",
		max: 1000
	},
	edited: {
		type: Boolean,
		label: "Edited",
		optional: true
 	},
	timestamp: {
		type: Number,
		label: "Timestamp"
	}
});

CardPattern = new SimpleSchema({
	user_id: {
		type: String
	},
	username: {
		type: String,
		label: "Name"
	},
	allow_email: {
		type: Boolean,
		label: "Allow Email"
	},
	availability: {
		type: String,
		label: "Availability",
		max: 140
	}
});

EventPattern = new SimpleSchema({
	_id: {
		type: String
	},
	title: {
		type: String,
		label: "Title",
		max: 140
	},
	date: {
		type: Number,
		label: "Date",
	},
	location: {
		type: String,
		label: "Location",
		max: 1000
	},
	description: {
		type: String,
		label: "Description",
		max: 1000
	},
	attendees: {
		type: [String],
		label: "Attendees"
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
		type: String,
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
		type: [MessagePattern],
		label: "Messages",
		optional: true
	},
	cards: {
		type: [CardPattern],
		label: "Contact Cards",
		optional: true
	},
	events: {
		type: [EventPattern],
		label: "Events",
		optional: true
	},
	createdDate: {
		type: Date,
		label: "Created on"
	}
}));