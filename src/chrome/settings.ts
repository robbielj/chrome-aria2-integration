import { Settings } from "../downloader/settings";

export class ChromeSettings extends Settings {

    constructor(private settings: StoreJSStatic) {
        super();
    }

    get jsonRPCPath() {
        return this.settings.get('rpcpath') || 'http://localhost:6800/jsonrpc';
    }

    set jsonRPCPath(path: string) {
        this.settings.set('rpcpath', path);
    }

    get rpcUser(): string {
        return this.settings.get('rpcuser') || '';
    }

    set rpcUser(user: string) {
        this.settings.set('rpcuser', user);
    }

    get rpcToken(): string {
        return this.settings.get('rpctoken') || '';
    }

    set rpcToken(token: string) {
        this.settings.set('rpctoken', token);
    }

    get fileSize(): string {
        return this.settings.get('filesize') || '500M';
    }

    set fileSize(size: string) {
        this.settings.set('filesize', size);
    }

    get whiteListTypes(): string[] {
        return this.settings.get('whitelisttype') || [];
    }

    set whiteListTypes(types: string[]) {
        this.settings.set('whitelisttype', types);
    }

    get whiteListSites(): string[] {
        return this.settings.get('whitelistsite') || [];
    }

    set whiteListSites(sites: string[]) {
        this.settings.set('whitelistsite', sites);
    }

    get blackListSites(): string[] {
        return this.settings.get('blacklistsite') || [];
    }

    set blackListSites(sites: string[]) {
        this.settings.set('blacklistsite', sites);
    }

    get protocolWhitelist(): string[] {
        return this.settings.get('protocolwhitelist') || ['blob', 'http', 'https'];
    }

    set protocolWhitelist(protocols: string[]) {
        this.settings.set('protocolwhitelist', protocols);
    }

    get capture(): boolean {
        return this.settings.get('capture');
    }

    set capture(value: boolean) {
        this.settings.set('capture', value);
    }

    get sizeCapture(): boolean {
        return this.settings.get('sizecapture');
    }

    set sizeCapture(value: boolean) {
        this.settings.set('sizecapture', value);
    }

}