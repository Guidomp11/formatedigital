const config = rootRequire('config');
const Singleton = require('./Singleton');
const Promise = require('bluebird');
//const FS = require('fs');
const FS = Promise.promisifyAll(require('fs'));
const Path = require('path');

class File extends Singleton {
    constructor() {
        super();
    }

    //Verifica si el archivo existe en el path
    FileExists(path) {
        /*return new Promise((resolve, reject) => {
          console.log(file);
            return FS.stat(file).then((stats) => {
                resolve(stats.isFile());
            }).catch((err) => {
                if (err.code === 'ENOENT') resolve(false);
                else reject(err);
            });
        });*/
        /*return new Promise((resolve) => {
            FS.exists(file, resolve);
        });*/

        return new Promise(function(resolve) {
            FS.lstat(path, function(error, stats) {
                resolve(!error);
            });
        });
    }

    PathExist(path, cb) {
        FS.stat(path, function fsStat(err, stats) {
            if (err) {
                if (err.code === 'ENOENT') return cb(null, false);
                else return cb(err);
            }
            return cb(null, stats.isDirectory());
        });
    }

    FileSave(file, buffer, cb) {
        /*if (!File.GetInstance.FileExists(file, (err, fileExist) => {
                if (!fileExist) {
                    FS.writeFile(file, buffer, (err) => {
                        if (err) cb(err);
                        else cb(null, "Archivo creado correctamente.");
                    });
                } else {
                    cb('El archivo ya existe, por favor intente otro.')
                }
            }));*/

        return File.GetInstance.FileExists(file).then((exists) => {
            if (!exists)
                FS.writeFile(file, buffer, (err) => {
                    if (err) cb(err);
                    else cb(null, "Archivo creado correctamente.");
                });
        }).then(() => {
            console.log("Write!");
        }).then(() => {
            console.log("Logi");
        });

        /*return File.GetInstance.FileExists((file)/*).then((isFile)*/
        /*=> {
                 console.log("Is file. " , isFile);
                 //if( isFile) return new FS.writeFileAsync(file,buffer);
               /*});*/
        /*.then(() => {
                 console.log("Write!");
               })*/
        /*.catch((e) => {
                    throw e;
                });*/

        /*return FS.writeFileAsync(file, buffer).then(function() {

        }).catch(e => {
            console.log("E: ", e);
        });*/
    }

    PictureSave(file, buffer, cb) {
        if (!File.GetInstance.FileExists(file, (err, fileExist) => {
                if (!fileExist) {
                    FS.writeFile(file, buffer, 'binary', (err) => {
                        if (err) cb(err);
                        else cb(null, "Archivo creado correctamente.");
                    });
                } else {
                    cb('El archivo ya existe, por favor intente otro.')
                }
            }));
    }

    FileRemove(file, cb) {
        FS.unlink(file, (err) => {
            if (err && err.code == 'ENOENT') {
                cb('El archivo no existe.')
            } else if (err) {
                cb('No se pudo borrar el archivo.');
            } else {
                cb(null);
            }
        });
    }

    /*DeleteFolderAndContent(path) {
        return new Promise((resolve, reject) => {
            fs.emptyDir(path, (error) => {
                if (error) {
                    reject(error);
                } else {
                    fs.rmdir(path, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(undefined);
                        }
                    });
                }
            });
        });
    }*/

    //---------------------------------------------

    FileOrFolderExists(path) {
        return new Promise(function(resolve) {
            FS.lstat(path, function(error, stats) {
                resolve(!error);
            });
        });
    }

    CreateFile(file, data, encoding) {
        return new Promise(function(resolve, reject) {
            FS.writeFile(file, data, encoding, function(err) {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    DeleteFile(path) {
        return new Promise(function(fileResolve, fileReject) {
            /*if (path === undefined || path == '') fileReject("A");
            else {*/
            FS.unlink(path, function(error) {
                if (error) {
                    fileReject(error);
                } else {
                    fileResolve();
                }

            });
            /*}*/
        });
    }

    CreateFolder(dir) {
        return File.GetInstance.FileOrFolderExists(dir).then(function(exists) {
            return new Promise(function(resolve, reject) {
                if (!exists) {
                    FS.mkdir(dir, function(err) {
                        if (err) reject(err);
                        else resolve();
                    });
                } else resolve();
            });
        });
    }

    DeleteFolder(dirToDelete) {
        return File.GetInstance.FileOrFolderExists(dirToDelete).then(function(exists) {
            if (exists) {
                return FS.readdir(dirToDelete).then(function(files) {
                    var promisses = files.map(function(file) {
                        var currentPath = path.join(dirToDelete, file);
                        return stats(currentPath).then(function(stats) {
                            if (stats.isDirectory()) {
                                return deleteDir(currentPath);
                            } else {
                                return rmFile(currentPath);
                            }

                        });
                    });
                    return Promise.all(promisses).then(function() {
                        return rmdir(dirToDelete);
                    });
                });
            }

        });
    }

    ListFilesInFolder(dir) {
        return File.GetInstance.FileOrFolderExists(dir).then(function(exists) {
            return new Promise(function(resolve, reject) {
                if (exists) {
                    return FS.readdir(dir, (err, files) => {

                        let f = [];

                        if (!err) {
                            files.forEach((fileName) => {
                                if (Path.extname(fileName) === ".png")
                                    f.push(fileName);
                            })
                        }
                        resolve(f);
                    });
                }
            });
        });
    }
}

module.exports = File.GetInstance;
