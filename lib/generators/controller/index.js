/* Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';
var Base = require('../../base.js');

module.exports = Base.extend({
    constructor: function () {
        var self = this,
            parts,
            error;

        this.type = 'controller';

        Base.apply(this, arguments);

        this._addQuestions(this.commonQuestions);

        // Determining the affinity and selector from the filename.
        if (this.arguments[0]) {
            parts = this.arguments[0].split('.');

            // Make sure that the filename is valid.
            if (parts.length >= 3 && parts.length <= 4 && parts[0] === 'controller' && parts[parts.length - 1] === 'js') {
                // Make sure that the affinity is valid.
                error = this.questions.affinity.validate(parts[1]);
                if (typeof error === 'string') {
                    this.log(this.error('>> ') + error);
                } else {
                    this.specifiedOptions.affinity = parts[1];
                    // If a selector was specified, make sure that it's valid.
                    if (parts.length === 4) {
                        error = this.questions.selector.validate(parts[2]);
                        if (typeof error === 'string') {
                            this.log(this.error('>> ') + error);
                        } else {
                            this.specifiedOptions.selector = parts[2];
                        }
                    }
                }
            } else {
                this.log(this.error('>>') + ' Invalid controller filename "' + this.arguments[0] +
                    '". Expecting controller.{affinity}[.{selector}].js');
            }
        }

        this.argument('filename', {
            required: false,
            desc: 'controller.{affinity}[.{selector}].js'
        });
    },

    init: function () {
        this.generate(this.async());
    },

    _validateLocation: function (cb) {
        var self = this;

        if (self.baseDir) {
            // The baseDir has been set by the mojit generator.
            cb();
        } else if (!self.location.isPackageRoot && self.location.path.indexOf('mojits') === self.location.path.length - 2) {
            // If currently inside a mojit.
            // Get the mojit name from the current directory.
            self.specifiedOptions.mojit = self.location.path[self.location.path.length - 1];
            cb();
        } else {
            // The current directory is not a mojit. Ask whether to proceed.
            self.prompt([{
                type: 'confirm',
                name: 'continue',
                default: true,
                message: self.warn('Controllers should be placed inside a mojit, continue?')
            }], function (response) {
                if (!response.continue) {
                    process.exit();
                }
                // The mojit is unknown
                self.specifiedOptions.mojit = '';
                cb();
            });
        }
    },

    _create: function (cb) {
        var mojit = this.specifiedOptions.mojit,
            affinity = this.specifiedOptions.affinity,
            selector = this.specifiedOptions.selector === 'no selector' ? null : this.specifiedOptions.selector,
            action = this.specifiedOptions.action,
            module = mojit + affinity[0].toUpperCase() + affinity.substring(1) +
                (selector ? selector[0].toUpperCase() + selector.substring(1) : '') + 'Controller';

        this.template('controller.js', this.baseDir + 'controller.' + affinity + (selector ? '.' + selector : '') + '.js', {
            action: action,
            module: module,
            mojit: mojit,
            affinity: affinity,
            selector: selector
        });

        cb();
    }
});