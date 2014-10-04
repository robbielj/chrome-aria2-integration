chrome-aria2-integration
========================

aria2 integration extension for Chrome

Web Store: http://chrome.google.com/webstore/detail/aria2c-integration/edcakfpjaobkpdfpicldlccdffkhpbfk

This extension captures new download tasks and sends them to aria2 automatically, as per capturing rules you set (file size, file type, site whitelist, site blacklist)

It also adds a context menu item. Right click any link and select "Download with aria2" to add the link to aria2 download queue.

Click the extension icon to reveal a quick view of tasks. Click a progress bar area to pause/unpause a task or remove a completed/error task.

Requirements:  

1. Chrome >= 31. Auto download capture doesn't work before this version.
2. aria2c (>=1.15.2) with RPC enabled. RPC user and password/RPC secret can be set in options. Also rpc-listen-all and rpc-allow-origin-all needs to be switched on.

Example: aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all=true

Recommend: Tick off "Ask where to save each file before downloading" in Chrome settings.
