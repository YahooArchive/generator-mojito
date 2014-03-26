'use strict';
var Base = require('../lib/base.js');

var MojitGenerator = Base.extend({
    constructor: function () {

        Base.apply(this, arguments);

        this._addQuestions({
            mojit: {
                type: 'input',
                message: 'Mojit name: ',
                validate: function (name) {
                    return name && typeof name === 'string' ? true : 'Please enter a valid moji name';
                }
            },
            view: {
                type: 'confirm',
                message: 'Create a view?',
                default: true,
                desc: 'Whether to include a view',
                alias: 't',
                defaults: true
            },
            binder: {
                type: 'confirm',
                message: 'Create a binder?',
                default: true,
                when: function (ans) {
                    // Only ask if view was selected, since can't have binder without view.
                    return ans.view || this.options.view;
                }.bind(this),
                desc: 'Whether to include a binder',
                alias: 'b',
                defaults: true
            }
        });

        this.argument('name', {
            required: false
        });
    },

    init: function () {
        this.generate(this.async());
    },

    _validateLocation: function (cb) {
        var self = this;

        if (this.baseDir) {
            // The baseDir has been set by the mojit generator.
            this.baseDir += 'mojits/';
            cb();
        } else if (this.location.isPackageRoot) {
            this.baseDir = 'mojits/';
            cb();
        } else if (this.location.path.indexOf('mojits') === this.location.path.length - 1) {
            cb();
        } else {
            // Mojit can only be created within the application root or within a mojits directory.
            this.prompt([{
                type: 'confirm',
                name: 'continue',
                default: true,
                message: self.warn('Mojits should be placed within the mojits directory in the application root, continue?')
            }], function (response) {
                if (!response.continue) {
                    process.exit();
                }
                self.baseDir = 'mojits/';
                cb();
                return response;
            });
        }
    },

    _create: function (cb) {
        var self = this,
            generators = ['controller'];

        this.baseDir += this.specifiedOptions.mojit + '/';

        // By default don't ask for controller/binder selector.
        // However if the user specifies it through the selector command line option then it will be recognized.
        if (self.options.selector === undefined) {
            self.options.selector = null;
        }

        if (self.specifiedOptions.view) {
            generators.push('view');
        }
        if (self.specifiedOptions.binder) {
            generators.push('binder');
        }

        self.callGenerators(generators, cb);
    }
});

module.exports = MojitGenerator;