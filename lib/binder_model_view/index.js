/* Copyright (c) 2014, Yahoo! Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

'use strict';
var Base = require('../base.js');

module.exports = function (type) {
    return Base.extend({
        constructor: function () {
            var self = this,
                parts,
                error,
                questions;

            this.type = type;
            this.ext = (type === 'view' ? '.hb.html' : '.js');

            Base.apply(this, arguments);

            questions = {
                base: {
                    type: 'input',
                    message: this.Type + ' name: ',
                    validate: function (name) {
                        return !!name;
                    }
                },
                action: this.commonQuestions.action,
                affinity: this.commonQuestions.affinity,
                selector: this.commonQuestions.selector
            };

            if (this.type === 'model') {
                delete questions.action;
                this.baseOrAction = 'base';
            } else {
                delete questions.base;
                delete questions.affinity;
                this.baseOrAction = 'action';
            }

            this._addQuestions(questions);

            // Determining the action and selector from the filename.
            if (this.arguments[0]) {
                if (this.arguments[0].indexOf('.') !== -1) {
                    parts = this.arguments[0].split('.');

                    // Make sure that the filename is valid.
                    if (/^([^\.]+\.){1,2}((hb\.html)|(js))$/.test(this.arguments[0])) {
                        // Make sure that the affinity is valid.
                        error = this.questions[Object.keys(this.questions)[0]].validate(parts[0]);
                        if (typeof error === 'string') {
                            this.log(this.error('>> ') + error);
                        } else {
                            this.specifiedOptions[Object.keys(this.questions)[0]] = parts[0];
                            // If a selector was specified, make sure that it's valid.
                            if (parts[2] === 'js' || parts[2] === 'hb') {
                                error = this.questions[Object.keys(this.questions)[1]].validate(parts[1]);
                                if (typeof error === 'string') {
                                    this.log(this.error('>> ') + error);
                                } else {
                                    this.specifiedOptions[Object.keys(this.questions)[1]] = parts[1];
                                }
                            }
                        }
                    } else {
                        this.log(this.error('>>') + ' Invalid ' + this.type +  ' filename "' + this.arguments[0] +
                            '". Expecting {action}[.{selector}]' + this.ext);
                    }
                } else {
                    error = this.questions[this.baseOrAction].validate(this.arguments[0]);
                    if (typeof error === 'string') {
                        this.log(this.error('>> ') + error);
                    } else {
                        this.specifiedOptions[this.baseOrAction] = this.arguments[0];
                    }
                }
            }

            this.argument('filename', {
                required: false,
                desc: this.type === 'model' ? '{name}.{affinity}[.{selector}].js' : '{action}[.{selector}' + this.ext
            });
        },

        init: function () {
            this.generate(this.async());
        },

        _validateLocation: function (cb) {
            var self = this;

            if (self.baseDir) {
                // The baseDir has been set by the mojit generator.
                self.baseDir += self.type + 's/';
                cb();
            } else if (
                // The current directory is not a package and is within a mojits directory.
                !self.location.isPackageRoot && self.location.path.indexOf('mojits') !== -1 &&
                // The current directory should either be binders/views
                (self.location.path[self.location.path.indexOf('mojits') + 2] === self.type + 's' ||
                    // or the mojit.
                    self.location.path.indexOf('mojits') === self.location.path.length - 2)) {
                // If currently inside a mojit.
                // Get the mojit name from the current directory.
                self.specifiedOptions.mojit = self.location.path[self.location.path.indexOf('mojits') + 1];
                self.baseDir = '/' + self.location.path.slice(0, self.location.path.indexOf('mojits') + 2).join('/') + '/' + self.type + 's/';
                cb();
            } else {
                // The current directory is not a mojit a mojit's binders/views directory. Ask whether to proceed.
                self.prompt([{
                    type: 'confirm',
                    name: 'continue',
                    default: true,
                    message: self.warn(self.Type + 's should be placed inside the ' + self.type + 's directory of a mojit, continue?')
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
                affinity = this.type === 'model' && this.specifiedOptions.affinity,
                selector = this.specifiedOptions.selector === 'no selector' ? null : this.specifiedOptions.selector,
                baseOrAction = this.specifiedOptions[this.baseOrAction],
                module = mojit + baseOrAction[0].toUpperCase() + baseOrAction.substring(1) +
                    (selector ? selector[0].toUpperCase() + selector.substring(1) : '') + this.Type;

            this.template(this.type + this.ext, this.baseDir + baseOrAction +
                    (affinity ? '.' + affinity : '') +
                    (selector ? '.' + selector : '') + this.ext, {
                mojit: mojit,
                selector: selector,
                base: baseOrAction,
                action: baseOrAction,
                module: module
            });

            cb();
        }
    });
};