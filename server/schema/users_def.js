// This collection is automatically generated by accounts-password package
//Users = new Mongo.Collection('users');
EmailPattern = new SimpleSchema({
	address: {
		type: String,
		label: 'Email Address',
		regEx: SimpleSchema.RegEx.Email,
		max: 500
	},
	verified: {
		type: Boolean,
		label: 'Email Verified'
	}
});

PersonalMsgPattern = new SimpleSchema({
	_id: {
		type: String,
		label: 'Message ID'
	},
	from_id: {
		type: String
	},
	from_username: {
		type: String,
		label: 'Sender Name'
	},
	board: {
		type: String,
		label: 'Initial Board'
	},
	text: {
		type: String,
		label: 'Text',
		max: 10000  // 10,000
	},
	date: {
		type: Number,
		label: 'Date Sent'
	},
	seen: {
		type: Boolean,
		label: 'Seen'
	}
});

PersonalEventPattern = new SimpleSchema({
	_id: {
		type: String
	}
});

ProfilePattern = new SimpleSchema({
	essentialName: {
		type: String,
		label: 'Lowercase Username',
		regEx: /^[^A-Z]+$/
	},
	zip: {
		type: String,
		label: 'Zip Code',
		regEx: /^[0-9]{3}$/,
		min: 000,
		max: 999
	},
	boards: {
		type: [String],
		label: 'Boards',
		regEx: /^[a-zA-Z0-9_]+$/,
		min: 1,
		max: 203
	},
	messages: {
		type: [PersonalMsgPattern],
		label: 'Messages'
	},
	events: {
		type: [PersonalEventPattern],
		label: 'Events'
	},
	cards: {
		type: [String],
		label: 'Boards With User\'s Card',
		max: 203
	}
});

Meteor.users.attachSchema(new SimpleSchema({
	username: {
		type: String,
		label: 'Name',
		regEx: /^[a-zA-Z0-9 ]+$/,
		min: 1,
		max: 36
	},
	emails: {
		type: [EmailPattern],
		label: 'Emails',
		maxCount: 1,
		optional: true
	},
	createdAt: {
		type: Date,
		label: 'Created Date',
		optional: true
	},
	profile: {
		type: ProfilePattern,
		label: 'Profile'
	},
	services: {
		type: Object,
		blackbox: true,
		optional: true
	}
}));