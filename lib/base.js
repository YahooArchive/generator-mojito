'use strict';

var yeoman = require('yeoman-generator'),
    async = require('async'),
    fs = require('fs'),
    chalk = require('chalk'),
    Env = require('yeoman-generator/lib/env/index.js');

module.exports = yeoman.generators.Base.extend({
    constructor: function (args, opts) {
        this.type = this.type || '';
        this.Type = (this.type[0] || '').toUpperCase() + (this.type).substring(1);

        yeoman.generators.Base.apply(this, arguments);

        this.specifiedOptions = {};
        this.baseDir = '';
        this.args = args;
        this.opts = opts;

        this.options.name = this.arguments[0];

        this.commonQuestions = {
            action: {
                type: 'input',
                default: 'index',
                message: this.Type + ' action:',
                validate: function (action) {
                    return !!(action && typeof action === 'string');
                },
                desc: this.Type + ' Action',
                alias: 'a',
                defaults: 'index'
            },
            affinity: {
                type: 'list',
                default: 0,
                choices: [
                    'common',
                    'server',
                    'client'
                ],
                message: this.Type + ' affinity: ',
                validate: function (affinity) {
                    if (this.choices.indexOf(affinity) === -1) {
                        return 'Invalid affinity "' + affinity + '". Expecting "common", "server", or "client".';
                    }
                    return !!(typeof affinity === 'string' && affinity.trim());
                },
                desc: this.Type + ' Affinity',
                alias: 'f',
                defaults: 'common'
            },
            selector: {
                type: 'input',
                default: 'no selector',
                message: this.Type + ' selector:',
                validate: function (selector) {
                    return !!(selector === null || typeof selector === 'string' && selector.trim());
                },
                desc: this.Type + ' Selector',
                alias: 's'
            }
        };
    },

    generate: function (cb) {
        var self = this;
        self._getSpecifiedOptions();
        self._getLocation();
        self._validateLocation(function () {
            self._askQuestions(function () {
                self._create(cb);
            });
        });
    },

    option: function (name, config) {
        config.name = name;
        this._options.push(config);
    },

    _addQuestions: function (questions) {
        // Specify what are the acceptable arguments and options.
        var option,
            filter = function (input) {
                return typeof input === 'string' ? input.trim() : input;
            };

        for (option in questions) {
            questions[option].name = option;
            questions[option].required = false;
            questions[option].filter = filter;

            if (questions[option].desc) {
                this.option(option, questions[option]);
            }
        }

        this.questions = questions;
    },

    _getSpecifiedOptions: function () {
        var error,
            option,
            value;
        // Get the option values specified in the command line.
        for (option in this.questions) {
            value = this.options[option];
            // Use the option alias if available
            if (value === undefined && this.questions[option].alias) {
                value = this.options[this.questions[option].alias];
            }
            if (this.questions[option] && this.specifiedOptions[option] === undefined
                    && value !== undefined) {
                error = this.questions[option].validate && this.questions[option].validate(value);
                if (typeof error === 'string') {
                    // The value is valid if there is not validate function for it or it returns true.
                    this.log(this.error('>> ') + error);
                } else if (error === false){
                    this.log(this.error('>> ') + 'Invalid ' + option + ' value');
                } else {
                    this.specifiedOptions[option] = value;
                }
            }
        }
    },

    _getLocation: function () {
        var path = process.cwd(),
            dir;

        this.location = {
            isPackageRoot: fs.readdirSync(path).indexOf('package.json') !== -1,
            pathStr: path,
            path: path.substring(1).split('/')
        };
    },

    // Ask questions for any missing option.
    _askQuestions: function (cb) {
        var unansweredQuestions = [],
            option,
            done;

        for (option in this.questions) {
            this.questions[option].name = option;
            if (this.specifiedOptions[option] === undefined) {
                unansweredQuestions.push(this.questions[option]);
            }
        }

        if (unansweredQuestions.length > 0) {
            this.prompt(unansweredQuestions, function (ans) {
                for (option in ans) {
                    this.specifiedOptions[option] = ans[option];
                }
                cb();
            }.bind(this));
        } else {
            cb();
        }
    },

    callGenerators: function (generatorConfigs, cb) {
        var self = this,
            generatorArr = [],
            serialGenerators = [];

        generatorConfigs.forEach(function (generatorConfig) {
            generatorConfig = {
                name: generatorConfig.name || generatorConfig,
                specifiedOptions: generatorConfig.specifiedOptions || self.specifiedOptions
            };

            var generator = self.env.create('mojito:' + generatorConfig.name, {
                arguments: [],
                options: self.options
            });

            generator.baseDir    = self.baseDir;
            generator.conflicter = self.conflicter;
            generator.specifiedOptions = generatorConfig.specifiedOptions;

            serialGenerators.push(function (generatorDone) {
                generator.generate(generatorDone);
            });
            generatorArr.push(generator);
        });

        async.series(serialGenerators, function (err) {
            cb(err, generatorArr);
        });
    },

    warn: chalk.yellow,
    error: chalk.red,
    underline: chalk.underline
});