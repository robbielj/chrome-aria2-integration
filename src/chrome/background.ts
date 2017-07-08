import * as store from "store";
import { ChromeSettings } from "./settings";
import { Downloader } from "../downloader/downloader";

const settings = new ChromeSettings(store);
const downloader = new Downloader(settings);

const showNotification = () => {
    const options = {
        type: 'basic',
        title: 'Aria2 Integration',
        iconUrl: 'icons/notificationicon.png',
        message: 'The download has been sent to aria2 queue'
    };
    chrome.notifications.create('senttoaria2', options, () => { });
    window.setTimeout(() => chrome.notifications.clear('senttoaria2', () => { }), 3000);
};

chrome.contextMenus.create({
    title: 'Download with aria2',
    id: 'linkclick',
    contexts: ['link']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'linkclick') {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => downloader.getCookies(info.linkUrl, cookies => {
            downloader.addUri(info.linkUrl, {
                referer: tabs[0].url,
                header: 'Cookie:' + cookies
            });
            showNotification();
        }));
    }
});

chrome.downloads.onDeterminingFilename.addListener(item => {
    if (settings.capture) {
        chrome.tabs.query({
            'active': true,
            'currentWindow': true
        }, tabs => {
            if (downloader.isCapture(item.fileSize, tabs[0].url, item.url, item.filename)) {
                downloader.getCookies(item.url, cookies => {
                    chrome.downloads.cancel(item.id, () => {
                        downloader.addUri(item.url, {
                            referer: tabs[0].url,
                            header: 'Cookie:' + cookies,
                            out: item.filename
                        });
                        showNotification();
                    });
                });
            }
        });
    }
});