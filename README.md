# generator-mojito [![Build Status](https://secure.travis-ci.org/yahoo/mojito.png)](http://travis-ci.org/yahoo/mojito)

> [Yeoman](http://yeoman.io/) generator for [Mojito](https://developer.yahoo.com/cocktails/mojito/)  
> Scaffolds out an entire Mojito application or individual Mojito components.

<img src="https://raw.githubusercontent.com/yahoo/generator-mojito/master/screenshot.png?token=1406782__eyJzY29wZSI6IlJhd0Jsb2I6eWFob28vZ2VuZXJhdG9yLW1vaml0by9tYXN0ZXIvc2NyZWVuc2hvdC5wbmciLCJleHBpcmVzIjoxMzk3MDkzMDEzfQ%3D%3D--9ab27223aafb98047ea0754fca27ab597449820c" alt="Screenshot" width="65%">

## Getting Started

We recommend users to use this scalfolding tool through the `mojito create` command provided by the [`mojito-cli`](https://github.com/yahoo/mojito-cli#create) package. If you would like to use Yeoman, follow the instructions below:

Make sure you have Yeoman install globally:

```
$ npm install -g yo
```

Install the mojito generator:

```
$ npm install -g generator-mojito
```

Run the generator:

```
$ yo mojito
```

To run a specific generator run `yo mojito:<generator_name>`; see below for all [available generators](#available-generators). Append `-h` to view the usage summary. 

### Available Generators

* app
* mojit
* controller
* view
* binder
* addon
* module
* model
* config
