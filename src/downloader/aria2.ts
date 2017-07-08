import { DownloadParams } from "./downloader";
import { Settings } from "./settings";

/// [authorizationToken, [urls], RequestParams]
type RPCParams = Array<string | string[] | DownloadParams>;

interface RequestParams {
    jsonrpc: string;
    method: string;
    id: string;
    params: RPCParams;
}

export class Aria2 {

    constructor(private settings: Settings) {
    }

    getAuth(url: string): string {
        return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
    }

    addUri(uri: string, options: DownloadParams) {
        this.request(this.settings.jsonRPCPath, 'aria2.addUri', [[uri], options]);
    }

    private request(jsonRpcPath: string, method: string, params: RPCParams) {
        const jsonrpc_version = '2.0',
            xhr = new XMLHttpRequest(),
            auth = this.getAuth(jsonRpcPath);

        const request: RequestParams = {
            jsonrpc: jsonrpc_version,
            method: method,
            id: (new Date()).getTime().toString(),
            params: params
        };

        xhr.open('POST', `${jsonRpcPath}?tm=${(new Date()).getTime().toString()}`, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        if (this.settings.rpcUser !== '') {
            xhr.setRequestHeader('Authorization',
                `Basic ${btoa(this.settings.rpcUser + ':' + this.settings.rpcToken)})`);
        } else if (this.settings.rpcToken !== '') {
            request.params = [`token:${this.settings.rpcToken}`, ...request.params];
        }
        xhr.send(JSON.stringify(request));
    }
}