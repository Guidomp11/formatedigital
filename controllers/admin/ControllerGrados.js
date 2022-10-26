const Config = rootRequire('config');
const Usuario = rootRequire('utilities').usuario;
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');

const View = rootPath() + 'views/admin/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelGrados = rootRequire('models/Grado');
const ModelColegios = rootRequire('models/Colegio');
const ModelProfesores = rootRequire('models/Profesor');
const ModelAlumnos = rootRequire('models/Alumno');
const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlGrados = "/administrador/grados";

/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    /**
     * Muestra el listado de grados disponibles
     * @param general Objeto con datos importantes para el sitio
     */
    get: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        general.grados = {
            list: {},
            routes: {
                root: UrlGrados + "/",
                add: UrlGrados + ActionAdd,
                del: UrlGrados + ActionDel,
                mod: "/" + ActionMod,
                block: UrlGrados + ActionBlock
            },
        };

        return ModelGrados.List().then(function(grados) {
            general.grados.list = grados ? Functions.ObfuscateIds(grados, false) : null;
            return ModelColegios.GetNames(grados.map((obj) => {
                return obj.active && obj.colegio_id ? obj.colegio_id : null;
            }));
        }).then(function(colegios) {
            /*Busco los Id del colegio y los reemplazo, si coinciden, con el nombre del colegio*/
            colegios.forEach(function(colegio) {
                general.grados.list.filter(function(obj, index) {
                    if (obj.colegio_id == colegio._id) {
                        obj.colegio_nombre = colegio.nombre;
                    }
                });
            });

            general.grados.colegios = colegios;
            res.render(View + 'grados-list', general);
            delete res.locals.errors;
            delete res.locals.info;
        });
    },

    /**
     * Muestra el formulario de carga para un grado
     * Solicita informacion a la base de datos necesarios para el formulario
     * @param general Objeto con datos importantes para el sitio
     */
    get_add: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        general.grados = {
            routes: {
                add: UrlGrados + ActionAdd,
                root: UrlGrados
            },
            lists: {} //Cargar con listados de las queries
        }

        /* Solicito informacion para las listas */
        return ModelColegios.List().then(function(colegios) {
            general.grados.lists.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
            return ModelProfesores.List();
        }).then(function(profesores) {
            general.grados.lists.profesores = profesores ? Functions.ObfuscateIds(profesores) : null;
            return ModelAlumnos.List();
        }).then(function(alumnos) {
            general.grados.lists.alumnos = alumnos ? Functions.ObfuscateIds(alumnos) : null;
            return ModelGames.List();
        }).then(function(juegos) {
            general.grados.lists.juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
            res.render(View + 'grados-add', general);
            delete res.locals.errors;
            delete res.locals.info;
        }).catch(function(errors) {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    },

    /**
     * Carga el grado segun el formulario en add
     */
    post_add: (req, res) => {
        //nombre, colegioId, division, profesor_id, alumnos_id, juegos
        /*let nombre = req.body.gradoNombre;
        let division = req.body.gradoDivision;
        let colegioId = Functions.DeObfuscateId(req.body.colegioId);
        let profesorId = Functions.DeObfuscateId(req.body.profesorId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        let alumnos = [];
        var alumnosLength = Array.isArray(req.body.alumnosId) ? req.body.alumnosId.length : req.body.alumnosId; //Total de grados a iterar.
        alumnosLength = alumnosLength === undefined ? 0 : alumnosLength;

        if (alumnosLength > 0) {
            for (var i = 0; i < alumnosLength; i++) {;
                alumnos.push({
                    alumnoId: Functions.DeObfuscateId(req.body.alumnosId[i])
                });
            }
        } else if (req.body.alumnosId !== undefined) {
            alumnos.push({
                alumnoId: Functions.DeObfuscateId(req.body.alumnosId)
            });
        }

        let juegos = [];
        var juegosLength = Array.isArray(req.body.juegosId) ? req.body.juegosId.length : req.body.juegosId; //Total de grados a iterar.
        juegosLength = juegosLength === undefined ? 0 : juegosLength;

        if (juegosLength > 0) {
            for (var i = 0; i < juegosLength; i++) {;
                juegos.push({
                    juegoId: Functions.DeObfuscateId(req.body.juegosId[i])
                });
            }
        } else if (req.body.juegosId !== undefined) {
            juegos.push({
                juegoId: Functions.DeObfuscateId(req.body.juegosId)
            });
        }

        return ModelGrados.New(nombre, colegioId, division, profesorId, alumnos, juegos, myId).then(function(duplicado) {
            if (duplicado) {
                return new Promise(function(resolve, reject) {
                    reject('El Colegio ya se encuentra cargado.');
                });
            } else {
                req.session.info = [{
                    msg: "Creado correctamente!"
                }];
                return res.redirect(UrlGrados);
            }
        }).catch((errors) => {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });*/

        //Se cargan distinto...
        let nombre = req.body.gradoNombre;
        let division = req.body.gradoDivision;
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelGrados.New(nombre, division, myId).then(function(duplicado) {
            if (duplicado) {
                return new Promise(function(resolve, reject) {
                    reject('El grado ya se encuentra cargado.');
                });
            } else {
                req.session.info = [{
                    msg: "Creado correctamente!"
                }];
                return res.redirect(UrlGrados);
            }
        }).catch((errors) => {
            req.session.errors = [{
                msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
            }];
            return res.redirect(req.originalUrl);
        });
    },

    /**
     * Elimina un grado del sistema
     */
    post_del: (req, res) => {
        //Alimina un Colegio
        let gradoToDelete = Functions.DeObfuscateId(req.body.gradoId);
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelGrados.Delete(gradoToDelete, true, myId).then(function() {
            req.session.info = [{
                msg: "Eliminado correctamente!"
            }];
            return res.redirect(UrlGrados);
        });
    },

    /**
     * Bloquea un grado del sistema
     */
    post_block: (req, res) => {
        //Bloquea o desbloquea un administrador
        let gradoToBlock = Functions.DeObfuscateId(req.body.gradoId);
        let active = (req.body.gradoActive == "true");
        let myId = Functions.DeObfuscateId(Usuario.getId());

        return ModelGrados.Block(gradoToBlock, !active, myId).then(function() {
            req.session.info = [{
                msg: (active ? "Bloqueado" : "Desbloqueado") + " correctamente!"
            }];
            return res.redirect(UrlGrados);
        });
    },

    /**
     * Muestra el formulario de edicion de un grado
     * @param general Objeto con datos importantes para el sitio
     */
    get_mod: (req, res, general) => {
        let gradoId = Functions.DeObfuscateId(req.params.id);

        res.locals.errorMod = req.session.errorMod;
        res.locals.infoMod = req.session.infoMod;
        delete req.session.errorMod;
        delete req.session.infoMod;

        general.error_message = res.locals.errorMod;
        general.info_message = res.locals.infoMod;

        if (Functions.ValidateId(gradoId)) {
            let colegio = null;

            ModelGrados.GetInfo(gradoId).then(function(gradoInfo) {
                if (gradoInfo) {
                    let grado = gradoInfo;
                    general.grado = {
                        dato: grado,
                        routes: {
                            root: UrlGrados + "/",
                            add: UrlGrados + ActionAdd,
                            del: UrlGrados + ActionDel,
                            mod: ActionMod,
                            block: UrlGrados + ActionBlock
                        },
                        lists: {} //Lsita de datos a elegir, disponibles en el sistema
                    };

                    //Obtnego la info del colegio
                    if (grado.colegio_id && grado.colegio_id !== undefined) {
                        return ModelColegios.GetName(grado.colegio_id).then(function(colegioName) {
                            general.grado.colegio = {
                                id: Functions.ObfuscateId(grado.colegio_id.toString()),
                                name: colegioName ? colegioName.nombre : ""
                            };

                            return new Promise(function(resolve, reject) {
                                resolve();
                            });
                        });
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Grado no existe.');
                    });
                }
            }).then(function() {
                //Obtengo la info del profesor
                let profesorId = general.grado.dato.profesor_id;
                if (profesorId && profesorId !== undefined) {
                    return ModelProfesores.GetContact(profesorId);
                }
            }).then(function(profesorContact) {
                if (profesorContact) {
                    profesorContact = JSON.parse(JSON.stringify(profesorContact));
                    general.grado.profesor = profesorContact;
                    general.grado.profesor.id = Functions.ObfuscateId(profesorContact._id.toString());
                }
                //Obtengo los alumnos del grado, filtrados
                if (general.grado.dato.alumnos_id && general.grado.dato.alumnos_id.length > 0) {
                    return ModelAlumnos.GetAlumnos(general.grado.dato.alumnos_id.map((obj) => {
                        return obj.active ? obj.alumnoId : null
                    }));
                }
            }).then(function(alumnos) {
                if (alumnos) {
                    alumnos = alumnos ? Functions.ObfuscateIds(alumnos) : null;
                    general.grado.alumnos = Functions.ReplaceEmptyValueWithCustom(alumnos, "---");
                }
                //Obtengo los juegos del grado, filtrados
                if (general.grado.dato.juegos && general.grado.dato.juegos.length > 0) {
                    return ModelGames.GetGames(general.grado.dato.juegos.map((obj) => {
                        return obj.active ? obj.juegoId : null
                    }));
                }
            }).then(function(juegos) {
                if (juegos) {
                    juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
                    general.grado.juegos = Functions.ReplaceEmptyValueWithCustom(juegos, "---");
                }
                //Ahora lleno las listas
                return ModelColegios.List();
            }).then(function(colegios) {
                general.grado.lists.colegios = colegios ? Functions.ObfuscateIds(colegios) : null;
                return ModelProfesores.List();
            }).then(function(profesores) {
                general.grado.lists.profesores = profesores ? Functions.ObfuscateIds(profesores) : null;
                return ModelAlumnos.List();
            }).then(function(alumnos) {
                general.grado.lists.alumnos = alumnos ? Functions.ObfuscateIds(alumnos) : null;
                return ModelGames.List();
            }).then(function(juegos) {
                general.grado.lists.juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
                res.render(View + 'grados-mod', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlGrados);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlGrados);
        }
    },

    /**
     * Modifica un grado del sistema
     */
    post_mod: (req, res) => {

        let gradoId = Functions.DeObfuscateId(req.params.id);

        if (Functions.ValidateId(gradoId)) {

            let nombre = req.body.gradoNombre;
            let division = req.body.gradoDivision;
            let colegioId = Functions.DeObfuscateId(req.body.colegioId);
            let profesorId = Functions.DeObfuscateId(req.body.profesorId);
            let myId = Functions.DeObfuscateId(Usuario.getId());

            let alumnos = [];
            var alumnosLength = Array.isArray(req.body.alumnosId) ? req.body.alumnosId.length : req.body.alumnosId; //Total de grados a iterar.
            alumnosLength = alumnosLength === undefined ? 0 : alumnosLength;

            if (alumnosLength > 0) {
                for (var i = 0; i < alumnosLength; i++) {;
                    alumnos.push({
                        alumnoId: Functions.DeObfuscateId(req.body.alumnosId[i])
                    });
                }
            } else if (req.body.alumnosId !== undefined) {
                alumnos.push({
                    alumnoId: Functions.DeObfuscateId(req.body.alumnosId)
                });
            }

            let juegos = [];
            var juegosLength = Array.isArray(req.body.juegosId) ? req.body.juegosId.length : req.body.juegosId; //Total de grados a iterar.
            juegosLength = juegosLength === undefined ? 0 : juegosLength;

            if (juegosLength > 0) {
                for (var i = 0; i < juegosLength; i++) {;
                    juegos.push({
                        juegoId: Functions.DeObfuscateId(req.body.juegosId[i])
                    });
                }
            } else if (req.body.juegosId !== undefined) {
                juegos.push({
                    juegoId: Functions.DeObfuscateId(req.body.juegosId)
                });
            }
            //gradoId, nombre, colegio_id, division, profesor_id, alumnos_id, juegos, modifiedy_by
            return ModelGrados.Update(gradoId, nombre, colegioId, division, profesorId, alumnos, juegos, myId).then(function() {
                req.session.info = [{
                    msg: "Grado modificado correctamente!"
                }];
                return res.redirect(UrlGrados);
            }).catch((errors) => {
                req.session.errors = [{
                    msg: errors && errors.length > 0 && errors[0].msg ? errors[0].msg : errors
                }];
                return res.redirect(req.originalUrl);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlGrados);
        }
    },

    /**
     * Muestra la informacion total de un grado
     * Carga todos sus datos correspondientes
     */
    get_info: (req, res, general) => {
      let gradoId = Functions.DeObfuscateId(req.params.id);

      res.locals.errorMod = req.session.errorMod;
      res.locals.infoMod = req.session.infoMod;
      delete req.session.errorMod;
      delete req.session.infoMod;

      general.error_message = res.locals.errorMod;
      general.info_message = res.locals.infoMod;

      if (Functions.ValidateId(gradoId)) {
          let colegio = null;

          ModelGrados.GetInfo(gradoId).then(function(gradoInfo) {
              if (gradoInfo) {
                  let grado = gradoInfo;
                  general.grado = {
                      dato: grado
                  };

                  //Obtnego la info del colegio
                  if (grado.colegio_id && grado.colegio_id !== undefined) {
                      return ModelColegios.GetName(grado.colegio_id).then(function(colegioName) {
                          general.grado.colegio = {
                              id: Functions.ObfuscateId(grado.colegio_id.toString()),
                              name: colegioName ? colegioName.nombre : ""
                          };

                          return new Promise(function(resolve, reject) {
                              resolve();
                          });
                      });
                  }
              } else {
                  return new Promise(function(resolve, reject) {
                      reject('El Grado no existe.');
                  });
              }
          }).then(function() {
              //Obtengo la info del profesor
              let profesorId = general.grado.dato.profesor_id;
              if (profesorId && profesorId !== undefined) {
                  return ModelProfesores.GetContact(profesorId);
              }
          }).then(function(profesorContact) {
              if (profesorContact) {
                  profesorContact = JSON.parse(JSON.stringify(profesorContact));
                  //general.grado.profesor = profesorContact;
                  general.grado.profesor = profesorContact.contact.nombre + " " + profesorContact.contact.apellido;
                  general.grado.profesor.id = Functions.ObfuscateId(profesorContact._id.toString());
              }
              //Obtengo los alumnos del grado, filtrados
              if (general.grado.dato.alumnos_id && general.grado.dato.alumnos_id.length > 0) {
                  return ModelAlumnos.GetAlumnos(general.grado.dato.alumnos_id.map((obj) => {
                      return obj.active ? obj.alumnoId : null
                  }));
              }
          }).then(function(alumnos) {
              if (alumnos) {
                  alumnos = alumnos ? Functions.ObfuscateIds(alumnos) : null;
                  general.grado.alumnos = Functions.ReplaceEmptyValueWithCustom(alumnos, "---");
              }
              //Obtengo los juegos del grado, filtrados
              if (general.grado.dato.juegos && general.grado.dato.juegos.length > 0) {
                  return ModelGames.GetGames(general.grado.dato.juegos.map((obj) => {
                      return obj.active ? obj.juegoId : null
                  }));
              }
          }).then(function(juegos) {
              if (juegos) {
                  juegos = juegos ? Functions.ObfuscateIds(juegos) : null;
                  general.grado.juegos = Functions.ReplaceEmptyValueWithCustom(juegos, "---");
              }
              res.render(View + 'grados-info', general);
              delete res.locals.errors;
              delete res.locals.info;
          }).catch(function(errors) {
            console.log("??? Grado: " , errors);
              req.session.errors = [{
                  msg: errors
              }];
              return res.redirect(UrlGrados);
          });
      } else {
          req.session.errors = [{
              msg: "Id invalido."
          }];
          return res.redirect(UrlGrados);
      }
    }

}
