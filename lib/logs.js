/*
* Library for storing and rotating logs
*/

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

// Container for the module
var lib = {};

// Base directory of the logs folder
lib.Basedir = path.join(__dirname, '/../.logs');

// Append a string to a file. Create the file if it does not exist
lib.append = (file, str, callback) => {
    // Open the file for appending
    fs.open(lib.Basedir+file+'.log','a',(err, fileDescriptor) => {
        if(!err && fileDescriptor) {
        // Append to the file anf close it
        fs.appendFile(fileDescriptor,str +'\n', (err) => {
            if(!err) {
                fs.close(fileDescriptor, (err) => {
                    if(!err) {
                        callback(false);
                    } else {
                        callback("Error closing file that was being appended");
                    }
                });
            } else {
                callback("Error appending the file");
            }
        });        
        } else {
            callback("could not open file for appending")
        }
    });
} ;

module.exports = lib;