//People = new Mongo.Collection("people");
People.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name",
		regEx: /^[a-zA-Z0-9]+$/,
		min: 1,
		max: 36
	},
	zip: {
		type: Number,
		label: "Zip Code",
		regEx: /^[0-9]{3}$/,
		min: 000,
		max: 999
	},
	boards: {
		type: [String],
		label: "Boards",
		regEx: /^[a-zA-Z0-9]+$/,
		min: 1,
		max: 200
	},
	email: {
		type: String,
		label: "Email",
		regEx: SimpleSchema.RegEx.Email,
		optional: true
	}
}));