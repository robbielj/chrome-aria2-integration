export abstract class Settings {

    abstract get jsonRPCPath();
    abstract set jsonRPCPath(path: string);

    abstract get rpcUser();
    abstract set rpcUser(user: string);

    abstract get rpcToken();
    abstract set rpcToken(token: string);

    abstract get fileSize();
    abstract set fileSize(size: string);

    abstract get whiteListTypes();
    abstract set whiteListTypes(types: string[]);

    abstract get whiteListSites();
    abstract set whiteListSites(sites: string[]);

    abstract get blackListSites();
    abstract set blackListSites(sites: string[]);

    abstract get protocolWhitelist();
    abstract set protocolWhitelist(protocols: string[]);

    abstract get capture();
    abstract set capture(value: boolean);

    abstract get sizeCapture();
    abstract set sizeCapture(value: boolean);

    join(values: string[], sep: string = ','): string {
        let result = '';
        values.forEach((value, index) => {
            result += value;
            if (index + 1 < values.length) {
                result += sep;
            }
        });
        return result;
    }

}