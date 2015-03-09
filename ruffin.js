Router.map(function() {
	this.route('home', {path: '/'} );
});

if (Meteor.isClient) {
	// Enable tooltips
	$(function () { $("[data-toggle='tooltip']").tooltip(); });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
