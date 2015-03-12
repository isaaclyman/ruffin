Router.configure({
	layoutTemplate: '',
	notFoundTemplate: '',
	loadingTemplate: ''
});

Router.map(function() {
	this.route('home', {path: '/'} );
});