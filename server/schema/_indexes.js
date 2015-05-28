Meteor.startup(function () {
	Meteor.users._ensureIndex({ 'profile.essentialName': 1 });
	Boards._ensureIndex({ 'board': 1 });
});
