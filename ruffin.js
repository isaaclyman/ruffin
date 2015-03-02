if (Meteor.isClient) {
	$(function() {
		$( document ).tooltip();
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
