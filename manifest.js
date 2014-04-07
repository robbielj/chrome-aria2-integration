this.manifest = {
    "name": "Aria2c Integration",
    "icon": "icons/icon64.png",
    "settings": [
        {
            "tab": i18n.get("RPC"),
            "name": "rpcpath",
            "type": "text",
            "label": i18n.get("JSONRPCPath"),
            "text": i18n.get("JSONRPCPathExample")
        },
        {
            "tab": i18n.get("RPC"),
            "name": "rpctoken",
            "type": "text",
            "label": i18n.get("RPCToken")
        },
        {
            "tab": i18n.get("RPC"),
            "name": "rpctokenDescription",
            "type": "description",
            "text": i18n.get("rpctokenDescription")
        }
    ],
    "alignment": [
        [
            "rpcpath",
            "rpctoken"
        ]
    ]
};
