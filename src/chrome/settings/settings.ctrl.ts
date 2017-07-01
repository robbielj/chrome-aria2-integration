import * as store from "store";
import * as $ from "jquery";
import "jquery-validation";
import { Settings } from "../../downloader/settings";

/// CSS
import "./settings.scss";

const settings = new Settings(store);

const loadSettings = () => {
    $('#enable-capture').prop('checked', settings.capture);
    $('#json-rpc-path').prop('value', settings.jsonRPCPath);
    $('#rpc-user').prop('value', settings.rpcUser);
    $('#rpc-secret').prop('value', settings.rpcToken);
    $('#enable-file-size').prop('checked', settings.sizeCapture);
    const fileSize = settings.fileSize.match(/^(\d*)(K|M|G|T)/i);
    $('#file-size').prop('value', fileSize[1]);
    $('#file-size-type').prop('value', fileSize[2]);
    $('#file-types').prop('value', settings.join(settings.whiteListTypes, ', '));
    $('#site-whitelist').prop('value', settings.join(settings.whiteListSites, ', '));
    $('#site-blacklist').prop('value', settings.join(settings.blackListSites, ', '));
    $('#protocol-whitelist').prop('value', settings.join(settings.protocolWhitelist, ', '));
};

const saveSettings = () => {
    const spaceRegex = new RegExp(/\s+/g);
    settings.capture = $('#enable-capture').prop('checked');
    settings.jsonRPCPath = $('#json-rpc-path').prop('value');
    settings.rpcUser = $('#rpc-user').prop('value');
    settings.rpcToken = $('#rpc-secret').prop('value');
    settings.sizeCapture = $('#enable-file-size').prop('checked');
    settings.fileSize = $('#file-size').prop('value') + $('#file-size-type').prop('value');
    settings.whiteListTypes = $('#file-types').prop('value').split(',')
        .map(value => value.replace(spaceRegex, ''));
    settings.whiteListSites = $('#site-whitelist').prop('value').split(',')
        .map(value => value.replace(spaceRegex, ''));
    settings.blackListSites = $('#site-blacklist').prop('value').split(',')
        .map(value => value.replace(spaceRegex, ''));
    settings.protocolWhitelist = $('#protocol-whitelist').prop('value').split(',')
        .map(value => value.replace(spaceRegex, ''));
};

const localize = () => {
    const elements = $('[data-localize]');
    elements.get().forEach(element => {
        const key = element.getAttribute('data-localize');
        const value = chrome.i18n.getMessage(key);
        element.innerHTML = value || element.innerHTML;
    });
};

loadSettings();
localize();
$('#settings-form').submit(e => {
    e.preventDefault();
    saveSettings();
    return false;
});