Template.pageNotFound.helpers({
	badPage: function() {
		return Router.current().url;
	}
});