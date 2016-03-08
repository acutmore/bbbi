// SAMPLE
this.manifest = {
    "name": "Better Bitbucket Issues",
    "icon": "icon.png",
    "settings": [
        {
            "tab": i18n.get("auth"),
            "group": i18n.get("login"),
            "name": "login_discription",
            "type": "description",
            "text": i18n.get("description")
        },
        {
            "tab": i18n.get("auth"),
            "group": i18n.get("login"),
            "name": "auth_button",
            "type": "button",
            "text": i18n.get("sign_in")
        },
        {
            "tab": i18n.get("auth"),
            "group": i18n.get("token"),
            "name": "token",
            "type": "description",
            "text": i18n.get("no_token"),
        },
        {
            "tab": i18n.get("auth"),
            "group": i18n.get("token"),
            "name": "refresh_token",
            "type": "description",
            "text": i18n.get("no_refresh_token"),
        }
    ]
};
