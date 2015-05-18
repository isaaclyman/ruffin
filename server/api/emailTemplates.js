/*
    VERIFY EMAIL ADDRESS
*/
var verify = {};
verify.verifyHTML = function(link) {
	var html =
    '<h1 style=\
    "Margin-top: 0;color: #565656;font-weight: 700;font-size: 36px;Margin-bottom: 18px;font-family: sans-serif;line-height: 42px">\
    Thanks for trusting us with your email address.</h1>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    It\'s safe with us, and we won\'t ask you for any other personal\
    information.</p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    Click the link below to verify that this address belongs to you.</p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">\
    <a href="' + link + '">Verify your email</a> (' + link + ')</p>\
    \
    <p style=\
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 24px">\
    Thanks again. You\'re the greatest.</p>';
    return html;
};
verify.verifyText = function(link) {
    var text =
    'Thanks for trusting us with your email address.\
    \n\n\
    It\'s safe with us, and we won\'t ask you for any other personal\
    information.\
    \n\n\
    Follow the link below to verify that this address belongs to you.\
    \n\n\
    ' + link + '\
    \n\n\
    Thanks again. You\'re the greatest.';
    return text;
};

Accounts.emailTemplates.from = "Do Not Reply - Ruffin";
Accounts.emailTemplates.siteName = "Ruffin";
Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return "The name \"" + user.username + "\" has been reserved";
};
Accounts.emailTemplates.verifyEmail.html = function(user, url) {
	return verify.verifyHTML(url);
};
Accounts.emailTemplates.verifyEmail.text = function(user, url) {
    return verify.verifyText(url);
};
