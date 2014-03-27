'use strict';
var Base = require('../../base.js');

module.exports = Base.extend({
    constructor: function () {
        var self = this,
            parts,
            error;

        this.choices = [
            'application.json',
            'dimensions.json',
            'routes.json',
            'defaults.json'
        ];

        Base.apply(this, arguments);

        this._addQuestions({
            file: {
                type: 'list',
                default: 0,
                choices: this.choices,
                message: 'Configuration type: ',
                defaults: 'common',
                validate: function (file) {
                    if (this.choices.indexOf(file.split('.')[0] + '.json') === -1) {
                        return 'Invalid configuration file "' + file + '". Expecting application, dimensions, routes, or defaults.';
                    }
                    return true;
                }
            }
        });

        // Determine if the filename is valid
        if (this.arguments[0]) {
            parts = this.arguments[0].split('.');
            error = this.questions.file.validate(parts[0])
            if (typeof error === 'string') {
                this.log(this.error('>> ') + error);
            } else {
                this.specifiedOptions.file = this.arguments[0] + (parts.length === 1 ? '.json' : '');
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
        if (!this.location.isPackageRoot && this.location.path.indexOf('mojits') !== -1) {
            // The user is most likely interested in creating defaults.json for a mojit.
            this.choices.unshift(this.choices.pop());
        }
        cb();
    },

    _validateConfigChoice: function (cb) {
        var self = this,
            warningMessage,
            type = self.specifiedOptions.file.split('.')[0],
            configType = type[0].toUpperCase() + type.substring(1);

        if (type === 'defaults' && (
                self.location.isPackageRoot || self.location.path.indexOf('mojits') !== self.location.path.length - 2)) {
            // The user selected defaults configuration and its either inside the application root
            // or not in a mojit.
            warningMessage = 'Defaults configuration files should be placed in a mojit\'s directory, continue?';
        } else if (!self.location.isPackageRoot && type !== 'defaults') {
            warningMessage = configType + ' configuration files should be placed in the application root, continue?';
        }

        if (warningMessage) {
            // The configuration type chosen does not belong in the current directory. Ask whether to proceed.
            self.prompt([{
                type: 'confirm',
                name: 'continue',
                default: true,
                message: self.warn(warningMessage)
            }], function (response) {
                if (!response.continue) {
                    process.exit();
                }
                cb();
            });
        } else {
            cb();
        }
    },

    _create: function (cb) {
        var self = this;
        self._validateConfigChoice(function () {
            var file = self.specifiedOptions.file,
                type = self.specifiedOptions.file.split('.')[0],
                settings = self['_' + type]();

            self.write(file, self._stringifySettings(settings));

            cb();
        });
    },

    _stringifySettings: function (settings) {
        var settingsStrArr = [];

        if (typeof settings !== 'object') {
            return settings;
        }

        settings.forEach(function (setting) {
            settingsStrArr.push(JSON.stringify(setting, null, '    '));
        });
        return '[' + settingsStrArr.join(', ') + ']';
    },

    _application: function () {
        return [{
            settings: ['master']
        }];
    },

    _defaults: function () {
        return [{
            settings: ['master'],
            config: {}
        }];
    },

    _routes: function () {
        return [{
            settings: ['master'],

            main: {
                verbs: ['get', 'post'],
                path: '/',
                call: 'mainframe.index'
            }
        }];
    },

    _dimensions: function () {
        try {
            return this.read(this.location.pathStr + '/node_modules/mojito/lib/dimensions.json');
        } catch (e) {
            this.log(this.warn('Unable to copy dimensions.json from the mojito package. Created simplified dimensions.'));
            return [{
                'dimensions': []
            }];
        }
    }
});