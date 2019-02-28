const fs = require('fs');
const path = require('path');
var dir = '';
var regExp = '';
var replace = '';

switch (process.env.TYPE) {
  case '1': {
    dir = './out/test/utils';
    regExp = '.test.js';
    replace = '.test._js';
    break;
  }
  case '2': {
    dir = './out/test/utils';
    regExp = '.test._js';
    replace = '.test.js';
    break;
  }
  case '3': {
    dir = './out/test/tests';
    regExp = '.test.js';
    replace = '.test._js';
    break;
  }
  case '4': {
    dir = './out/test/tests';
    regExp = '.test._js';
    replace = '.test.js';
    break;
  }
}

const match = RegExp(regExp, 'g');
const files = fs.readdirSync(dir);

files
  .filter(function(file) {
    return file.match(match);
  })
  .forEach(function(file) {
    var filePath = path.join(dir, file),
      newFilePath = path.join(dir, file.replace(match, replace));

    fs.renameSync(filePath, newFilePath);
  });
