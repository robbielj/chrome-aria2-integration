import * as store from "store";
import { Settings } from "../downloader/settings";
import { DownloadCapture, DownloadParams } from "../downloader/downloader";

const settings = new Settings(store);
const downloader = new DownloadCapture(settings);

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
            const params: DownloadParams = {};
            params.referer = tabs[0].url;
            params.header = 'Cookie:' + cookies
            this.downloader.addUri(info.linkUrl, params);
        }));
    }
});

chrome.downloads.onDeterminingFilename.addListener(item => {
    if (settings.capture) {
        chrome.tabs.query({
            'active': true,
            'currentWindow': true
        }, tabs => downloader.captureAdd(item, tabs[0].url));
    }
});