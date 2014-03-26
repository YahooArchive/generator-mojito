'use strict';
var Base = require('../lib/base.js'),
    chalk = require('chalk');

var MojitGenerator = Base.extend({
    constructor: function () {
        var self = this,
            error;

        Base.apply(self, arguments);

        if (self.generatorName === 'mojito') {
            self._addQuestions({
                generator: {
                    type: 'list',
                    default: 0,
                    choices: [
                        'app',
                        'mojit',
                        'controller',
                        'view',
                        'binder',
                        'addon',
                        'module',
                        'model',
                        'config'
                    ],
                    message: 'What would you like to create?'
                }
            });
        } else if (self.generatorName === 'app') {
            self._addQuestions({
                appname: {
                    type: 'input',
                    message: 'Application name: ',
                    validate: function (name) {
                        return name && typeof name === 'string' ? true : 'Please enter a valid application name';
                    }
                },
                root: {
                    type: 'input',
                    default: 'Main',
                    message: 'Root mojit name: ',
                    validate: function (name) {
                        return name && typeof name === 'string' ? true : 'Please enter a valid mojit name';
                    },
                    desc: 'Root Mojit Name',
                    alias: 'r'
                }
            });

            if (self.arguments[0]) {
                error = self.questions.appname.validate(self.arguments[0])
                if (typeof error === 'string') {
                    self.log(self.error('>> ') + error);
                } else {
                    self.specifiedOptions.appname = self.arguments[0]
                }
            }

            self.argument('appname', {
                required: false
            });

            self.on('end', function () {
                var appname = self.specifiedOptions.appname;
                self.prompt([{
                    name: 'install',
                    type: 'confirm',
                    message: 'Would you like to install dependencies for "' + appname + '"?',
                    default: true
                }], function (ans) {
                    var changeDir = 'Change to the "' + appname + '" directory.',
                        installMsg = ' Run ' + chalk.bold('npm install') + ' to install dependencies.',
                        startMsg = ' Run ' + chalk.bold('node app.js') + ' to start.';

                    if (ans.install) {
                        self.destinationRoot(self.baseDir);
                        self.npmInstall(self.baseDir, function (err) {
                            self.log('');
                            if (err) {
                                self.log.error('Installation failed: ' + err);
                            } else {
                                self.log.ok('Installation successful. ' + changeDir + startMsg);
                            }
                        });
                    } else {
                        self.log('');
                        self.log.ok(changeDir + installMsg + startMsg);
                    }
                });
            });
        } else {
            self.log.error('Invalid generator "' + self.generatorName + '"');
            self.invalid = true;
        }
    },

    init: function () {
        if (!this.invalid) {
            this.generate(this.async());
        }
    },

    _validateLocation: function (cb) {
        if (this.generatorName === 'app' && this.location.isPackageRoot) {
            // The current directory is a package, applications should belong to its own package.
            this.prompt([{
                type: 'confirm',
                name: 'continue',
                default: true,
                message: this.warn('Creating an application inside a package, continue?')
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
        var self = this,
            appname = self.specifiedOptions.appname;

        if (self.generatorName === 'mojito') {
            self.callGenerators([self.specifiedOptions.generator], cb);
        } else {

            // Create application directory.
            self.mkdir(appname);
            self.baseDir = self.location.pathStr + '/' + appname + '/';

            // Create package.json
            self.template('package.json', appname + '/package.json', {
                appname: appname
            });

            // Create app.js
            self.copy('app.js', appname + '/app.js');
            // Create routes.json
            self.copy('routes.json', appname + '/routes.json');

            // Create mojit
            self.options.mojit = self.specifiedOptions.root;
            self.options.view = true;
            if (self.options.selector === undefined) {
                self.options.selector = null;
            }

            self.callGenerators(['mojit'], function (err, generators) {
                // Create application.json
                self.template('application.json', appname + '/application.json', {
                    mojit: generators[0].specifiedOptions.mojit,
                    action: generators[0].specifiedOptions.action
                });
                cb();
            });
        }
    }
});

module.exports = MojitGenerator;