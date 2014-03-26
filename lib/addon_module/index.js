'use strict';
var Base = require('../base.js');

module.exports = function (type) {
    var Type = type[0].toUpperCase() + type.substring(1);
    return Base.extend({
        constructor: function () {
            var self = this,
                parts,
                error,
                questions;

            this.type = type;

            Base.apply(this, arguments);

            questions = {
                base: {
                    type: 'input',
                    message: this.Type + ' name: ',
                    validate: function (name) {
                        return !!name;
                    }
                },
                affinity: this.commonQuestions.affinity
            };

            if (type === 'addon') {
                questions.type = {
                    type: 'list',
                    default: 0,
                    choices: [
                        'ac',
                        'rs'
                    ],
                    message: 'Addon type: ',
                    validate: function (type) {
                        if (this.choices.indexOf(type) === -1) {
                            return 'Invalid type "' + type + '". Expecting "ac", or "rs".';
                        }
                        return true;
                    },
                    desc: 'Addon Type',
                    defaults: 'ac',
                    alias: 't'
                };
            }
            this._addQuestions(questions);

            if (this.arguments[0]) {
                if (this.arguments[0].indexOf('.') !== -1) {
                    // Determining the action and selector from the filename.
                    parts = this.arguments[0].split('.');

                    // Make sure that the filename is valid.
                    if (/^([^\.]+\.){2}js$/.test(this.arguments[0])) {
                        // Make sure that the affinity is valid.
                        error = this.questions.base.validate(parts[0]);
                        if (typeof error === 'string') {
                            this.log(this.error('>> ') + error);
                        } else {
                            this.specifiedOptions.base = parts[0];
                            // Make sure that the affinity is valid.
                            error = this.questions.affinity.validate(parts[1]);
                            if (typeof error === 'string') {
                                this.log(this.error('>> ') + error);
                            } else {
                                this.specifiedOptions.affinity = parts[1];
                            }
                        }
                    } else {
                        this.log(this.error('>>') + ' Invalid ' + this.type + ' filename "' + this.arguments[0]
                            + '". Expecting {name}.{affinity}.js');
                    }
                } else {
                    error = this.questions.base.validate(this.arguments[0]);
                    if (typeof error === 'string') {
                        this.log(this.error('>> ') + error);
                    } else {
                        this.specifiedOptions.base = this.arguments[0];
                    }
                }
            }

            this.argument('filename', {
                required: false
            });
        },

        init: function () {
            this.generate(this.async());
        },

        _validateLocation: function (cb) {
            var self = this,
                addonType;

            if (self.location.isPackageRoot) {
                self.baseDir = self.type === 'module' ? 'yui_modules/' : 'addons/';
                cb();
            } else if (self.type === 'module') {
                if (self.location.path[self.location.path.length - 1] !== 'yui_modules') {
                    // If the current directory is not yui_modules, then create module inside a new yui_modules directory.
                    self.baseDir = 'yui_modules/';
                }
                cb();
            } else if (self.type === 'addon') {
                if (self.location.path[self.location.path.length - 1] === 'addons' ||
                    self.location.path[self.location.path.length - 2] === 'addons') {
                    // The current directory is not a package and is within a addons directory.
                    addonType = self.location.path[self.location.path.indexOf('addons') + 1]
                    if (self.questions.type.validate(addonType) === true) {
                        self.specifiedOptions.type = addonType;
                    }
                    self.baseDir = '/' + self.location.path.slice(0, self.location.path.indexOf(self.type + 's') + 1).join('/') + '/';
                    cb();
                } else {
                    // The current directory is not a package root or within and addons directory.
                    self.prompt([{
                        type: 'confirm',
                        name: 'continue',
                        default: true,
                        message: self.warn('Addons should be placed inside the addons directory of an application, continue?')
                    }], function (response) {
                        if (!response.continue) {
                            process.exit();
                        }
                        self.baseDir = 'addons/';
                        cb();
                    });
                }
            }
        },

        _create: function (cb) {
            var base,
                Base = '',
                parts,
                addonType = this.specifiedOptions.type,
                affinity = this.specifiedOptions.affinity === 'no selector' ? null : this.specifiedOptions.affinity,
                module;

            parts = this.specifiedOptions.base.split('-');
            parts.forEach(function (part) {
                Base += (part[0] || '').toUpperCase() + part.substring(1);
            });
            base = (Base[0] || '').toLowerCase() + Base.substring(1);
            if (this.type === 'addon') {
                module = 'mojito-' + this.specifiedOptions.base.toLowerCase() + '-' + addonType + '-addon';
            } else {
                module = this.specifiedOptions.base;
            }

            if (this.type === 'addon') {
                this.baseDir += addonType + '/';
            }

            this.template(this.type + '.js', this.baseDir + [this.specifiedOptions.base, affinity, 'js'].join('.'), {
                base: base,
                Base: Base,
                type: addonType,
                module: module
            });

            cb();
        }
    });
};