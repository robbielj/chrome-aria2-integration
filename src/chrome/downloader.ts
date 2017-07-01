import { Aria2 } from "./aria2";
import { Settings } from "./settings";

type GetCookiesCallback = (cookie: string) => void;

export interface DownloadParams {
    cookie?: string;
    header?: string;
    out?: string;
    referer?: string;
}

export class DownloadCapture {

    private aria2: Aria2;

    constructor(private settings: Settings) {
        this.aria2 = new Aria2(settings);
    }

    showNotification() {
        const options = {
            type: 'basic',
            title: 'Aria2 Integration',
            iconUrl: 'icons/notificationicon.png',
            message: 'The download has been sent to aria2 queue'
        };
        chrome.notifications.create('senttoaria2', options, () => { });
        window.setTimeout(() => chrome.notifications.clear('senttoaria2', () => { }), 3000);
    }

    getCookies(url: string, callback: GetCookiesCallback) {
        chrome.cookies.getAll({
            'url': url
        }, cookies => {
            let result = '';
            cookies.forEach(cookie => result += `${cookie.name}=${cookie.value};`);
            callback(result);
        });
    }

    captureAdd(item: chrome.downloads.DownloadItem, tabUrl: string) {
        if (this.isCapture(item.fileSize, tabUrl, item.url, item.filename)) {
            this.getCookies(item.url, cookies => {
                const params: DownloadParams = {};
                params.referer = tabUrl;
                params.header = 'Cookie:' + cookies;
                params.out = item.filename;
                chrome.downloads.cancel(item.id, () => this.addUri(item.url, params));
            });
        }
    }

    addUri(uri: string, options: DownloadParams) {
        this.aria2.addUri(uri, options);
        this.showNotification();
    }

    private siteListProc(site: string) {
        return site === ''
            ? new RegExp('^\\s$', 'g')
            : new RegExp(site.replace(/\./g, '\\.').replace(/\,/g, '|').replace(/\*/g, '[^ ]*'), 'gi');
    }

    private isCapture(size: number, tabUrl: string, url: string, name: string): boolean {
        const bSites = this.siteListProc(this.settings.join(this.settings.blackListSites)),
            wSites = this.siteListProc(this.settings.join(this.settings.whiteListSites)),
            wTypes = this.settings.whiteListTypes.map(type => type.toLocaleLowerCase()),
            wProtocols = new RegExp(`^(${this.settings.join(this.settings.protocolWhitelist, '|')})`),
            fSize = this.settings.fileSize,
            fSizePrec = ['K', 'M', 'G', 'T'],
            fSizeBytes = parseFloat(fSize.match(/[\d\.]+/)[0]) *
                Math.pow(1024, fSizePrec.indexOf(fSize.match(/[a-zA-Z]+/)[0].toUpperCase()) + 1);
        
        switch (true) {
            // Skip blacklist sites
            case bSites.test(tabUrl):
                return false;
            // Accept whitelist sites
            case wSites.test(tabUrl):
                return true;
            // Protocol
            case url.match(wProtocols) !== null:
                switch (true) {
                    // Accept whitelisted types
                    case wTypes.indexOf(name.split('.').pop().toLocaleLowerCase()) !== -1:
                        return true;
                    // Accept if size capture is disabled
                    case !this.settings.sizeCapture:
                        return true;
                    // Only accept above file sizes
                    case (size >= fSizeBytes && this.settings.sizeCapture):
                        return true;
                    default:
                        return false;
                }
            default:
                return false;
        }
    }

}