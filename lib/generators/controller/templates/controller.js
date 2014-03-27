YUI.add('<%= module %>', function (Y, NAME) {
    'use strict';

    Y.namespace('mojito.controllers')[NAME] = {
        <%= action %>: function (ac) {
            ac.done({
                data: 'Controller: <%= affinity %><% if (selector) {%> <%= selector %><% } %>'
            });
        }
    };

}, '0.0.1', {
    requires: [
    ]
});
