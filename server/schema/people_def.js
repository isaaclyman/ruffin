//People = new Mongo.Collection("people");
People.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name",
		max: 36
	},
	zip: {
		type: Number,
		label: "Zip Code",
		max: 3
	},
	hobbies: {
		type: [String],
		label: "Hobbies"
	},
	email: {
		type: String,
		label: "Email"
	}
}));