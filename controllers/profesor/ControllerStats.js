const Config = rootRequire('config');
const Functions = rootRequire('functions');
const File = rootRequire('utilities').file;
const Promise = require('bluebird');
const Usuario = rootRequire('utilities').usuario;
const Languages = rootRequire('structures/Language');
const FirstBy = require('thenby');

const View = rootPath() + 'views/profesor/';

/************************************************************************/
/*                                 MODELS                               */
/************************************************************************/

const ModelProfesor = rootRequire('models/Profesor');
const ModelAlumno = rootRequire('models/Alumno');
const ModelColegio = rootRequire('models/Colegio');
const ModelGrado = rootRequire('models/Grado');
const ModelGames = rootRequire('models/Games');

/************************************************************************/
/*                                  URLS                                */
/************************************************************************/

const UrlProfesor = "/profesor";
const UrlProfesorStatsAlumns = "/profesor/stats/alumns";
const UrlProfesorStatsCollege = "/profesor/stats/college";


/************************************************************************/
/*                                ACTIONS                               */
/************************************************************************/

const ActionAdd = Config.actions.add;
const ActionMod = Config.actions.mod;
const ActionDel = Config.actions.del;
const ActionBlock = Config.actions.block;

module.exports = {

    get_stats_college: (req, res, general) => {
        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        /**
         * Debe listar los grados segun el colegio seleccionado
         * Al seleccionar un grado, mostrar las estadisticas generales de TODOS los alumnos
         * pertenecientes a ese grado
         * Get Colegio
         * Get Grados
         */

        let profesorId = Functions.DeObfuscateId(Usuario.getId());

        if (Functions.ValidateId(profesorId)) {

            let colegiosId = [];
            let gradosId = [];
            let gamesId = [];

            ModelProfesor.GetInfo(profesorId).then(function(profesor) {
                if (profesor) {
                    //Get colegios
                    general.profesor = {
                        colegios: profesor.colegios,
                        grados: profesor.grados
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Profesor no existe.');
                    });
                }
            }).then(function() {
                //Divido los iDs que necesito para las busquedas de usuarios
                colegiosId = general.profesor.colegios ? general.profesor.colegios.map((obj) => {
                    return obj.active ? obj.colegioId : null
                }) : null;
                gradosId = general.profesor.grados ? general.profesor.grados.map((obj) => {
                    return obj.active ? obj.gradoId : null
                }) : null;
                //Solicito los datos de los colegios
                return ModelColegio.GetInfos(colegiosId);
            }).then(function(colegios) {
                //Asocio los datos al profesor de cada colegio
                if (colegios && general.profesor.colegios) {
                    colegios = Functions.ObfuscateIds(colegios, false);
                    general.profesor.colegios = Functions.ObfuscateCustomIds(general.profesor.colegios, "colegioId", false);
                    general.profesor.colegios = JSON.parse(JSON.stringify(general.profesor.colegios));

                    general.profesor.colegios.map((colegioProfesor) => {
                        colegios.map((colegio) => {
                            //Los ids son ofuscados de entrada.
                            if (colegio.id.toString() == colegioProfesor.colegioId.toString()) {
                                colegioProfesor.datos = colegio;
                            }
                            if (colegio.juegos && colegio.juegos.length > 0) {
                                colegio.juegos.map((juego) => {
                                    if (juego.active) gamesId.push(juego.juegoId); //Referencia de los juegos a solicitar del colegio
                                });
                            }
                        });
                    });
                }
                //Solicito los grados del profesor
                return ModelGrado.GetDivisions(gradosId);
            }).then(function(grados) {
                //Asocio los grados a los colegios que le corresponde
                if (grados && grados.length > 0) {
                    grados = Functions.ObfuscateIds(grados, false);
                    general.profesor.colegios.map((colegio) => {
                        colegio.grados = grados;
                    });
                }
                //Solicito un listado de los juegos del colegio, para que elija que promedio quiere
                return ModelGames.GetGames(gamesId);
            }).then(function(juegos) {
                //Asocio los juegos obtenidos a cada colegio...
                if (juegos && juegos.length > 0) {
                    let juegosFiltered = []; //Guarda todos los juegos filtrados para los colegios
                    juegos = Functions.ObfuscateIds(juegos);
                    //Reviso cada colegio, y verifico si coincide con cada juego encontrado, para despues asociar la referencia al colegio.
                    general.profesor.colegios.map((colegio) => {
                        juegos.map((juego) => {
                            if (colegio.datos.juegos) {
                                colegio.datos.juegos.map((juegoColegio) => {
                                    if (juegoColegio.juegoId.toString() == juego._id.toString()) {
                                        //Tengo los juegos que le corresponden a cada colegio.... los guardo en donde va
                                        //juegoColegio.info = juego; //Tengo la informacion de cada juegos en el colegio que va.
                                        //Sanitizo los datos, no preciso todo el conjunto de datos
                                        let j = {
                                            id: juego.id,
                                            title: juego.title
                                        };
                                        juegosFiltered.push(j);
                                        //juegosFiltered.push(juego);
                                    }
                                });
                            }
                        });
                        //Guardo los juegos en el colegio, mas directo (evito el nesting)
                        if (juegosFiltered && juegosFiltered.length > 0) {
                            colegio.juegos = juegosFiltered; //Guardo la referencia al colegio
                            juegosFiltered = []; // y limpio para la siguiente ronda
                        }
                    });
                }
            }).then(function() {
                /*console.log(require('util').inspect(general.profesor.colegios, {
                    depth: null
                }));*/
                res.render(View + 'stats-colleges', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                console.log("Stats colegio error: ", errors);
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesorStatsCollege);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesor);
        }
    },

    /*Muestra las estadisticas del grado segun el colegio y grado seleccionado*/
    get_stats_college_collegeId_gradoId: (req, res, general) => {
        /*
         * Solicitar las alumnos que pertenecen al colegio y grado seleccionados
         * Buscar el juego correspondiente, y calcular el promedio de todos los alumnos
         */
        let colegioId = Functions.DeObfuscateId(req.params.collegeId);
        let gradoId = Functions.DeObfuscateId(req.params.gradoId);
        let gameId = Functions.DeObfuscateId(req.params.gameId);

        if (Functions.ValidateId(colegioId) && Functions.ValidateId(gradoId) && Functions.ValidateId(gameId)) {
            res.locals.errors = req.session.errors;
            res.locals.info = req.session.info;

            delete req.session.errors;
            delete req.session.info;

            general.error_message = res.locals.errors;
            general.info_message = res.locals.info;

            //Solicito la info del colegio
            ModelColegio.GetName(colegioId).then(function(colegio) {
                //Guardo los datos del colegio para la UI y solicito los alumnos que le corresponden al colegio, segun su grado
                //Si no es parseado a JSON no se puede alterar los datos obtenidos mas abajo... (FAGGOT!!!)
                general.colegio = JSON.parse(JSON.stringify(colegio));
                //Preciso la division, para mostrar en la UI
                return ModelGrado.GetDivision(gradoId);
            }).then(function(grado) {
                general.colegio.grado = grado;
                //Preciso la informacion del juego (para la UI)
                return ModelGames.GetInfo(gameId);

            }).then(function(juego) {
                general.colegio.juego = juego;
                //Solicito todos los alumnos que le corresponden al profesor segun su colegio y grado.
                return ModelAlumno.ListByColegioAndGrado(colegioId, gradoId);
            }).then((alumnos) => {
                //Filtro por el juego que solicite...
                if (alumnos && alumnos.length > 0) {
                    //Saco todos los juegos que no me interesan, dejo el seleccionado en 'gameId'
                    let gameFiltered = []; //Referencia de TODOS los datos de los alumnos, (solo el juego seleccionado)
                    //Stats por lvl
                    let lvlStats = [];

                    alumnos.map((gameFilter) => {
                        if (gameFilter.active && gameFilter.stats.game_stats) {
                            gameFilter.stats.game_stats.map((stats) => {
                                if (stats.game_id.toString() == gameId) {
                                    gameFiltered.push(stats);
                                }
                            });
                        }
                    });

                    //General statistics
                    let totalStars = 0;
                    let totalCalcTime = 0;
                    let totalWins = 0;
                    let totalAttempts = 0;
                    let maxLevelReached = 1; //Los niveles arrancan en 1

                    //Con los datos filtrados, ya solo queda calcular el promedio de cada dato
                    if (gameFiltered && gameFiltered.length > 0) {
                        gameFiltered.map((game) => {
                            //console.log(game.level);
                            //Ver como 'promediar' este conjunto de datos...
                            if (game.level) {
                                //Guardo el maximo nivel llegado.
                                maxLevelReached = game.level.length > maxLevelReached ? game.level.length : maxLevelReached; //Nunca 0 ?

                                let levelAlumn = 1; //Nivel de alumno

                                game.level.map((level) => {

                                    totalStars += Number(level.stars);
                                    totalCalcTime += Number(level.calc_times);
                                    totalWins += Number(level.wins);
                                    totalAttempts += Number(level.attempts);

                                    if (lvlStats[levelAlumn] == null) {
                                        lvlStats[levelAlumn] = {
                                            wins: 0,
                                            attempts: 0,
                                            calc: 0,
                                            stars: 0
                                        };
                                    }

                                    lvlStats[levelAlumn].wins += Number(level.wins);
                                    lvlStats[levelAlumn].attempts += Number(level.attempts);
                                    lvlStats[levelAlumn].calc += Number(level.calc_times);
                                    lvlStats[levelAlumn].stars += Number(level.stars);
                                    levelAlumn++;
                                });
                            }
                        });
                    }

                    let aciertos = parseInt((Number(totalWins) / Number(totalAttempts)) * 100);
                    let calc = parseInt((Number(totalCalcTime) / Number(totalAttempts)) * 100);

                    lvlStats = lvlStats.filter((lvl) => {
                        return lvl != undefined;
                    });

                    general.colegio.stats = {
                        general: lvlStats,
                        maxLevel: maxLevelReached,
                        promedio: {
                            aciertos: aciertos,
                            calculadora: calc
                        }
                    };
                }

                res.render(View + 'stats-college', general);
                delete res.locals.errors;
                delete res.locals.info;

            }).catch(function(errors) {
                console.log("Stats colegio grado error: ", errors);
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesorStatsCollege);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesorStatsCollege);
        }
    },

    get_stats_alumns: (req, res, general) => {

        res.locals.errors = req.session.errors;
        res.locals.info = req.session.info;
        delete req.session.errors;
        delete req.session.info;

        general.error_message = res.locals.errors;
        general.info_message = res.locals.info;

        /**
         * Get Colegio
         * Get Grado
         * Find Alumnos with grado y colegio ===
         */

        let profesorId = Functions.DeObfuscateId(Usuario.getId());

        if (Functions.ValidateId(profesorId)) {
            let colegiosId = [];
            let gradosId = [];
            ModelProfesor.GetInfo(profesorId).then(function(profesor) {
                if (profesor) {
                    //Get colegios
                    general.profesor = {
                        colegios: profesor.colegios,
                        grados: profesor.grados
                    }
                } else {
                    return new Promise(function(resolve, reject) {
                        reject('El Profesor no existe.');
                    });
                }
            }).then(function() {
                //Divido los iDs que necesito para las busquedas de usuarios
                colegiosId = general.profesor.colegios ? general.profesor.colegios.map((obj) => {
                    return obj.active ? obj.colegioId : null
                }) : null;
                gradosId = general.profesor.grados ? general.profesor.grados.map((obj) => {
                    return obj.active ? obj.gradoId : null
                }) : null;
                //Solicito los juegos del colegio
                return ModelColegio.GetGamesByIds(colegiosId);
            }).then(function(games) {
                if (games && games.length > 0) {
                    //Recorro los colegios y verifico los juegos que tiene con los encontrados y los asocio
                    general.profesor.colegios = JSON.parse(JSON.stringify(general.profesor.colegios));
                    general.profesor.colegios.map((colegio) => {
                        games.map((game) => {
                            if (game._id.toString() == colegio.colegioId.toString()) {
                                colegio.games = game.juegos; //JUegos que le pertenece a cada colegio (usados para asociar al alumno los juegos del colegio)
                            }
                        })
                    });
                }
                //Find alumnos....
                return ModelAlumno.ListByColegiosAndGrados(colegiosId, gradosId);
            }).then(function(alumnos) {
                if (alumnos) {
                    general.profesor.alumnos = alumnos ? Functions.ObfuscateCustomIds(alumnos, "colegio_id", false) : null;
                    //Tengo la lista de alumnos correspondientes al profesor (se supone)
                    //Ahora tengo que filtrar los datos que muestra (colegio_id, grado_id) para despues mostrarlo en la UI
                    return ModelColegio.GetNames(alumnos.map((obj) => {
                        //return obj.active && obj.colegio_id ? obj.colegio_id : null;
                        return obj.active && obj.colegio_id ? obj.colegio_id : null;
                    }));
                }
            }).then(function(alumnosColegio) {
                //Tengo el colegio al que pertenece cada alumno
                //Los asocio a cada alumno segun corresponda.
                if (alumnosColegio && alumnosColegio.length > 0) {
                    alumnosColegio = Functions.ObfuscateIds(alumnosColegio, false);
                    general.profesor.colegios = Functions.ObfuscateCustomIds(general.profesor.colegios, "colegioId", false);

                    general.profesor.alumnos.map((alumno) => {
                        //Combine nombre+apellido
                        alumno.nombrecompleto = alumno.contact.nombre + ' ' + alumno.contact.apellido;
                        if (!alumno.nombrecompleto || alumno.nombrecompleto.length == 1) {
                            alumno.nombrecompleto = alumno.usuario;
                        }
                        //Reviso los ids buscados con los encontrados para asociar el nombre que le corresponde
                        alumnosColegio.map((colegio) => {
                            if (colegio.id.toString() == alumno.colegio_id.toString()) {
                                alumno.colegio_nombre = colegio.nombre;
                            }
                        });
                        //Asocio los juegos al alumno, segun su colegio
                        general.profesor.colegios.map((colegio) => {
                            if (alumno.colegio_id == colegio.colegioId) {
                                alumno.games = colegio.games;
                            }
                        });
                    });

                //general.profesor.colegios Contiene los datos de los juegos por colegio, debo solicitar la info de cada juego...
                //Pido al colegio los Ids de sus juegos para solicitar al ModelGames los datos correspondientes.
                let gameIds = [];
                general.profesor.colegios.map((colegio) => {
                    colegio.games.map((juego) => {
                        if (juego.active) gameIds.push(juego.juegoId);
                    });
                });
                return ModelGames.GetGames(gameIds);
              }
            }).then(function(games) {
                //Recibo los datos de los juegos del colegio, que tengo que asociarle a cada alumno segun su colegio y el gameId
                general.profesor.alumnos.map((alumno) => {
                    alumno.games.map((gameAlumno) => {
                        //A cada juego. lo comparo con el id que recibi de la busqueda anterior y lo asocio al alumno si contiene el ID del juego
                        games.map((game) => {
                            if (gameAlumno.juegoId.toString() == game._id.toString()) {
                                //Estos son datos que muestro en el front-end, es de utilidad para la seleccion de juegos, de manera transparente
                                gameAlumno.datos = {
                                    title: game.title,
                                    id: Functions.ObfuscateId(game._id.toString())
                                }
                            }
                        });
                    })
                });

                //Pido la division del alumno
                return ModelGrado.GetDivisions(general.profesor.alumnos.map((obj) => {
                    return obj.active && obj.grado_id ? obj.grado_id : null;
                }));
            }).then(function(alumnosGrado) {
                //Tengo el grado al que pertenece cada alumno
                //Los asocio a cada alumno segun corresponda.
                if (alumnosGrado) {
                    alumnosGrado = Functions.ObfuscateIds(alumnosGrado);
                    general.profesor.alumnos = general.profesor.alumnos ? Functions.ObfuscateCustomIds(general.profesor.alumnos, "grado_id", false) : null;
                    general.profesor.alumnos.map((alumno) => {
                        alumnosGrado.map((grados) => {
                            if (grados.id.toString() == alumno.grado_id.toString()) {
                                alumno.division = grados.division;
                            }
                        });
                    });
                }
            }).then(function() {
                //Protego el Id del usuario
                general.profesor.alumnos = general.profesor.alumnos ? Functions.ObfuscateIds(general.profesor.alumnos) : null;
                //console.log(require('util').inspect(general.profesor.alumnos, { depth: null }));
                //Sort data ;)
                if (general.profesor.alumnos) {
                    general.profesor.alumnos.sort(FirstBy("colegio_nombre", {
                        ignoreCase: true
                    }).thenBy("division").thenBy("contact.nombre", {
                        ignoreCase: true
                    }));
                }

                res.render(View + 'stats-alumns', general);
                delete res.locals.errors;
                delete res.locals.info;
            }).catch(function(errors) {
                console.log("Stats alumno error: ", errors);
                req.session.errors = [{
                    msg: errors
                }];
                return res.redirect(UrlProfesor);
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesor);
        }
    },

    /*Muestra las estadisticas del alumno segun el juego seleccionado*/
    get_stats_alumns_gameId_alumnId: (req, res, general) => {
        /*
         * Solicitar las estadisticas del alumno, segun el juego seleccionado y mostrarlo al usuario por niveles
         */

        let gameId = Functions.DeObfuscateId(req.params.gameId);
        let alumnoId = Functions.DeObfuscateId(req.params.alumnoId);

        if (Functions.ValidateId(alumnoId) && Functions.ValidateId(alumnoId)) {
            res.locals.errors = req.session.errors;
            res.locals.info = req.session.info;

            delete req.session.errors;
            delete req.session.info;

            general.error_message = res.locals.errors;
            general.info_message = res.locals.info;

            //Obtengo datos generales del alumno
            return ModelAlumno.GetInfo(alumnoId).then(function(alumno) {
                //Genero un nombre completo o seteo el nombre de usuario si no tiene datos
                let nombrecompleto = alumno.contact.nombre + ' ' + alumno.contact.apellido;
                if (!nombrecompleto || nombrecompleto.length == 1) {
                    nombrecompleto = alumno.usuario;
                }
                //Si no es parseado a JSON no se puede alterar los datos obtenidos mas abajo... (FAGGOT!!!)
                general.alumno = JSON.parse(JSON.stringify(alumno));
                general.alumno.nombrecompleto = nombrecompleto;
                //Solicito las estdisticas del juego para el alumno
                return ModelAlumno.GetGameStats(alumnoId, gameId);
            }).then(function(alumnoStats) {
                if (alumnoStats && alumnoStats.stats) {

                    let stats = alumnoStats.stats.game_stats;
                    let levels = 0; //stats ? stats.length : 0;
                    let promedio = 0;

                    let aciertos = 0;
                    let calc = 0;

                    //Calculo el promedio de todas las estadisticas / levels
                    stats.map((stat) => {
                        stat.level.map((level) => {
                            //promedio += Number(level.wins) + Number(level.stars) - Number(level.calc_times); // + Number(level.attempts);
                            aciertos += parseInt((Number(level.wins) / Number(level.attempts)) * 100);
                            calc += parseInt((Number(level.calc_times) / Number(level.attempts)) * 100);
                            levels++;
                        });
                    });

                    if (levels > 0) {
                        aciertos = parseInt(aciertos / levels);
                        calc = parseInt(calc / levels);
                    }

                    general.alumno.stats = {
                        general: stats,
                        levels: levels,
                        promedio: {
                            aciertos: aciertos,
                            calculadora: calc
                        }
                    }
                }

                /*console.log("-----------------ALUMNO STATS-----------------");
                console.log(require('util').inspect(general.alumno.stats, {
                    depth: null
                }));*/
                //Solcito informacion del juego del cual quiero estadisticas (para mostrarle al profesor cual es)
                return ModelGames.GetInfo(gameId);
            }).then(function(gameInfo) {
                if (gameInfo) {
                    //Preparo el thumbnail del juego
                    let noThumbnail = Config.public.img + "/" + Config.games.thumbnail_path;
                    let thumbnail = gameInfo.path_root + "/" + Config.games.thumbnail_path;
                    return File.FileOrFolderExists(thumbnail).then(function(exist) {
                        gameInfo.thumbnail = exist ? (thumbnail).replace(/\\/g, "/") : noThumbnail;
                        return gameInfo;
                    });
                }
            }).then(function(gameInfo) {
                general.alumno.game = gameInfo;
                /*console.log("-----------------GAME INFO-----------------");
                console.log(require('util').inspect(gameInfo, {
                    depth: null
                }));*/
                res.render(View + 'stats-alumno', general);
                delete res.locals.errors;
                delete res.locals.info;
            });
        } else {
            req.session.errors = [{
                msg: "Id invalido."
            }];
            return res.redirect(UrlProfesorStatsAlumns);
        }
    }

};
