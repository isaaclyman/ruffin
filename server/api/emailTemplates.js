/*
    VERIFY EMAIL ADDRESS
*/
var verifyHTML = function(link) {
	return
	'<h1 style=
    "Margin-top: 0;color: #565656;font-weight: 700;font-size: 36px;Margin-bottom: 18px;font-family: sans-serif;line-height: 42px">
    Thanks for trusting us with your email address.</h1>

    <p style=
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">
    It\'s safe with us, and we won\'t ask you for any other personal
    information.</p>

    <p style=
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">
    Click the link below to verify that this address belongs to you.</p>

    <p style=
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">
    ' + link + '</p>

    <p style=
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 25px">
    <strong style="font-weight: bold">We will send you one more email, and it\'s
    important</strong>. It contains the link you will need to access Ruffin
    with your reserved name. There\'s no other way to tell Ruffin who you are,
    so hold onto that email (or bookmark the link).</p>

    <p style=
    "Margin-top: 0;color: #565656;font-family: Georgia,serif;font-size: 16px;line-height: 25px;Margin-bottom: 24px">
    Thanks again. You\'re the greatest.</p>';
};

Accounts.emailTemplates.from = "Do Not Reply <no_reply+ruffin@isaaclyman.com>";
Accounts.emailTemplates.siteName = "Ruffin";
Accounts.emailTemplates.verifyEmail.subject = function(user) {
	return "Your name, " + user.username + ", has been reserved";
};
Accounts.emailTemplates.verifyEmail.html = function(user, url) {
	return verifyHTML(url);
};

