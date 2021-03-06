var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');
var db = require('../app/config');

// var User = require('../app/models/user');
// var Link = require('../app/models/link');
var Users = require('../app/models/user.js');
var Links = require('../app/models/link.js');
console.log(db.links, 'db.links');
exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {

  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }
  Links.findOne({url: uri}).exec(function(err, found) {
    if (found) {
      res.status(200).send(found);

    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        var newLink = new Links({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
        });

        newLink.save(function(err, result) {
          if (err) {
            console.err('could not save inside Links.findOne', err);
          } else {
            res.status(200).send(result);
          }
        });
      });
    }
  });
};


exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  Users.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  Users.findOne({ username: username })
    .exec(function(err, user) {
      if (!user) {
        var newUser = new Users({
          username: username,
          password: password
        });
        newUser.save(function(err, result) {
          if (err) {
            console.log('hitting 500');
            res.status(500).send(err);
          } else {
            util.createSession(req, res, result);
          }
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Links.findOne({ code: req.params[0] }).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};