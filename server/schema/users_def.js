// This collection is automatically generated by accounts-password package
//Users = new Mongo.Collection("users");
EmailPattern = new SimpleSchema({
	address: {
		type: String,
		label: "Email Address",
		regEx: SimpleSchema.RegEx.Email,
		max: 500
	},
	verified: {
		type: Boolean,
		label: "Email Verified"
	}
});

PersonalMsgPattern = new SimpleSchema({
	_id: {
		type: String
	},
	from_id: {
		type: String
	},
	from: {
		type: String,
		label: "Sender Name"
	},
	text: {
		type: String,
		label: "Text"
	},
	date: {
		type: Number,
		label: "Date Sent"
	}
});

PersonalEventPattern = new SimpleSchema({
	_id: {
		type: String
	}
});

ProfilePattern = new SimpleSchema({
	zip: {
		type: String,
		label: "Zip Code",
		regEx: /^[0-9]{3}$/,
		min: 000,
		max: 999
	},
	boards: {
		type: [String],
		label: "Boards",
		regEx: /^[a-zA-Z0-9_]+$/,
		min: 1,
		max: 203,
		optional: true
	},
	messages: {
		type: [PersonalMsgPattern],
		label: "Messages",
		optional: true
	},
	events: {
		type: [PersonalEventPattern],
		label: "Events",
		optional: true
	}
});

Meteor.users.attachSchema(new SimpleSchema({
	username: {
		type: String,
		label: "Name",
		regEx: /^[a-zA-Z0-9 ]+$/,
		min: 1,
		max: 36
	},
	emails: {
		type: [EmailPattern],
		label: "Emails",
		maxCount: 1,
		optional: true
	},
	createdAt: {
		type: Date,
		label: "Created Date",
		optional: true
	},
	profile: {
		type: ProfilePattern,
		label: "Profile"
	},
	services: {
		type: Object,
		blackbox: true,
		optional: true
	}
}));