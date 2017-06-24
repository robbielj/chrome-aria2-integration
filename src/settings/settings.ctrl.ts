import * as store from "store";
import * as $ from "jquery";
import "jquery-validation";
import { Settings } from "../settings";

/// CSS
import "./settings.css";

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
};

const saveSettings = () => {
    settings.capture = $('#enable-capture').prop('checked');
    settings.jsonRPCPath = $('#json-rpc-path').prop('value');
    settings.rpcUser = $('#rpc-user').prop('value');
    settings.rpcToken = $('#rpc-secret').prop('value');
    settings.sizeCapture = $('#enable-file-size').prop('checked');
    settings.fileSize = $('#file-size').prop('value') + $('#file-size-type').prop('value');
    settings.whiteListTypes = $('#file-types').prop('value').split(',')
        .map(value => value.replace(/\s+/g, ''));
    settings.whiteListSites = $('#site-whitelist').prop('value').split(',')
        .map(value => value.replace(/\s+/g, ''));
    settings.blackListSites = $('#site-blacklist').prop('value').split(',')
        .map(value => value.replace(/\s+/g, ''));
};

loadSettings();
$('#settings-form').submit(e => {
    e.preventDefault();
    saveSettings();
    return false;
});