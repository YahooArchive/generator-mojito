YUI.add('<%= module %>', function (Y, NAME) {
    'use strict';

    Y.namespace('mojito.binders')[NAME] = {
        init: function (mp) {

        },

        bind: function (node) {
            alert('<%= mojit %> <%= action %><% if (selector) {%> <%= selector %><% } %> binder');
        }
    };

}, '0.0.1', {
    requires: [
    ]
});
