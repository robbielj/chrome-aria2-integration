import * as $ from "jquery";
import { SafariSettings } from "./settings";
import { Downloader, DownloadParams } from "../downloader/downloader";

const settings = new SafariSettings(safari.extension.settings);
const downloader = new Downloader(settings);

const knownExtensions = ['7z', 'aac', 'aiff', 'avi', 'bz2', 'dat', 'dmg', 'flac', 'flv', 'gz',
    'iso', 'lz', 'lzma', 'm4a', 'm4p', 'm4v', 'mkv', 'mov', 'mp2', 'mp3', 'mp4', 'mpeg', 'mpg',
    'mpv', 'oga', 'ogg', 'ogv', 'pkg', 'rar', 'rm', 's7z', 'tar', 'tgz', 'vob', 'wav', 'webm',
    'wma', 'wmv', 'zip'];

const sendNotification = () => {
    new Notification('Download captured', {
        icon: 'icons/notificationicon.png'
    });
};

safari.application.addEventListener('beforeNavigate', event => {
    // Check if capture is enabled
    if (!settings.capture) {
        return;
    }

    const url: string = event['url'];
    if (!url) {
        return;
    }

    const filename = url.split('/').pop();
    const extensionMatch = filename.match(/\.(.+)$/);
    if (extensionMatch === null) {
        console.error('Could not match extension for url', url);
        return;
    }

    const extension = extensionMatch[1];
    if (settings.whiteListTypes.indexOf(extension) !== -1
        || knownExtensions.indexOf(extension) !== -1) {

        console.log(`URL ${url} will probably download a file with extension ${extension}`);
        if (downloader.isCapture(-1, url, url, filename)) {
            downloader.addUri(url, {
                referer: url,
                out: filename
            });
            sendNotification();
            event.preventDefault();
        }
    }

});