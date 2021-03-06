#!/usr/bin/env node

const path = require('path');
const fs = require('file-system');

/**
 *
 * Responds to an 'ls' request ("/ls/*"), given the request & response
 *
 * @param{http.ClientRequest} req The URL requested
 * @param{http.ServerResponse} res The response object to write to
 * @return{int} Returns status code - 0 if no errors, 1 if path does not exist
 *
 */
function ls(req, res) {
  // turn request URL into useful Path
  let lsURL = req.url.split(path.sep);
  lsURL = lsURL.slice(2, lsURL.length);

  let lsPath = path.join('Public/', lsURL.join('/'));

  console.log(`Files list request for ${lsPath}`);

  // get stats on valid directory and respond appropriately
  fs.stat(lsPath, (err, stats) => {
    // error handling
    if (err) {
      res.status(500)
          .jsonp({error: err})
          .end();

      console.log(`File or directory ${lsPath} does not exist!`);
      console.log();
      return 1;
    }

    // if no error but PATH is to file, get parent directory
    if (stats.isFile()) {
      let filename = lsURL[lsURL.length - 1];
      lsPath = lsPath.slice(0, lsPath.length - filename.length);
    }

    console.log(`Retrieving files at ${lsPath}`);

    // get list of files in requested directory
    let filesObj = {
      url: path.join(lsPath.slice(6, lsPath.length), '/'),
      directories: ['.', '..'],
      files: [],
    };

    fs.readdir(lsPath, (err, dir) => {
      // error handling
      if (err) {
        res.status(500)
            .jsonp({error: err})
            .end();
      }

      // processing files
      dir.forEach((file) => {
        let relative = path.join(lsPath, file);
        if (fs.lstatSync(relative).isDirectory()) {
          filesObj.directories.push(file);
        } else {
          filesObj.files.push(file);
        }
      });

      // send out found information
      console.log(filesObj);
      res.status(200)
          .jsonp(filesObj)
          .end();

      console.log();
    });
  });

  return 0;
}

module.exports = ls;
