Template.default.rendered = function() {
	var link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.sizes = '16x16 32x32';
    link.href = '/favico.png';
    document.getElementsByTagName('head')[0].appendChild(link);
};