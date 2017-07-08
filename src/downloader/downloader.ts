import { Aria2 } from "./aria2";
import { Settings } from "./settings";

type GetCookiesCallback = (cookie: string) => void;

export interface DownloadParams {
    cookie?: string;
    header?: string;
    out?: string;
    referer?: string;
}

export class Downloader {

    private aria2: Aria2;

    constructor(private settings: Settings) {
        this.aria2 = new Aria2(settings);
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

    isCapture(size: number, tabUrl: string, url: string, name: string): boolean {
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
                    case size >= fSizeBytes:
                        return true;
                    default:
                        return false;
                }
            default:
                return false;
        }
    }
    
    addUri(uri: string, options: DownloadParams) {
        this.aria2.addUri(uri, options);
    }

    private siteListProc(site: string) {
        return site === ''
            ? new RegExp('^\\s$', 'g')
            : new RegExp(site.replace(/\./g, '\\.').replace(/\,/g, '|').replace(/\*/g, '[^ ]*'), 'gi');
    }

}