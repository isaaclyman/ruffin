if (Meteor.isClient) {
	// Enable tooltips
	Template.home.rendered = function() {
		$('[data-toggle="tooltip"]').tooltip();
	}
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}