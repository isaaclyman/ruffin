//Users = new Mongo.Collection("users");
Email = new SimpleSchema({
	address: {
		type: String,
		label: "Email Address",
		regEx: SimpleSchema.RegEx.Email,
		max: 250
	},
	verified: {
		type: Boolean,
		label: "Email Verified"
	}
});

Meteor.users.attachSchema(new SimpleSchema({
	username: {
		type: String,
		label: "Name",
		regEx: /^[a-zA-Z0-9]+$/,
		min: 1,
		max: 36
	},
	emails: {
		type: [Email],
		label: "Emails",
		optional: true
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
	createdAt: {
		type: Date,
		label: "Created Date",
		optional: true
	}
}));