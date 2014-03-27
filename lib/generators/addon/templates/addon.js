YUI.add('<%= module %>', function (Y, NAME) {
    'use strict';

    function <%= Base %>Addon(command, adapter, ac) {

    }

    <%= Base %>Addon.prototype = {
        namespace: '<%= base %>'
    };

    Y.namespace('mojito.addons.<%= type %>').<%= base %> = <%= Base %>Addon;

}, '0.0.1', {
    requires: [
    ]
});