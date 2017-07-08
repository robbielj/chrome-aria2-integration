import { Settings } from "../downloader/settings";

export class SafariSettings extends Settings {

    constructor(private settings: SafariExtensionSettings | SafariExtensionSecureSettings) {
        super();
    }

    get jsonRPCPath() {
        return this.settings.getItem('rpcpath') || 'http://localhost:6800/jsonrpc';
    }

    set jsonRPCPath(path: string) {
        this.settings.setItem('rpcpath', path);
    }

    get rpcUser(): string {
        return this.settings.getItem('rpcuser') || '';
    }

    set rpcUser(user: string) {
        this.settings.setItem('rpcuser', user);
    }

    get rpcToken(): string {
        return this.settings.getItem('rpctoken') || '';
    }

    set rpcToken(token: string) {
        this.settings.setItem('rpctoken', token);
    }

    get fileSize(): string {
        return this.settings.getItem('filesize') || '500M';
    }

    set fileSize(size: string) {
        this.settings.setItem('filesize', size);
    }

    get whiteListTypes(): string[] {
        return this.settings.getItem('whitelisttype') || [];
    }

    set whiteListTypes(types: string[]) {
        this.settings.setItem('whitelisttype', types);
    }

    get whiteListSites(): string[] {
        const value = this.settings.getItem('blacklistsite') || '';
        return value.split(/,/g);
    }

    set whiteListSites(sites: string[]) {
        this.settings.setItem('whitelistsite', sites);
    }

    get blackListSites(): string[] {
        const value = this.settings.getItem('blacklistsite') || '';
        return value.split(/,/g);
    }

    set blackListSites(sites: string[]) {
        this.settings.setItem('blacklistsite', sites);
    }

    get protocolWhitelist(): string[] {
        const value = this.settings.getItem('protocolwhitelist') || 'blob,http,https';
        return value.split(/,/g);
    }

    set protocolWhitelist(protocols: string[]) {
        this.settings.setItem('protocolwhitelist', protocols);
    }

    get capture(): boolean {
        return this.settings.getItem('capture');
    }

    set capture(value: boolean) {
        this.settings.setItem('capture', value);
    }

    get sizeCapture(): boolean {
        return this.settings.getItem('sizecapture');
    }

    set sizeCapture(value: boolean) {
        this.settings.setItem('sizecapture', value);
    }

}