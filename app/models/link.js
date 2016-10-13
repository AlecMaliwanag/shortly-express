var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var linksSchema = mongoose.Schema({
  url: String,
  link: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
});
var Link = mongoose.model('Link', linksSchema);
var shorten = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

linksSchema.pre('save', function(next) {
  this.code = shorten(this.url);

  next();
});



module.exports = Link;
