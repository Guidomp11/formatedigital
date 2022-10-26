/**
 * Configuracion general para el sitio
 * secciones, datos de developer, rutas, y configuraciones generales
 */
module.exports = {
    developer: {
        mail: "pereznicolas@localware.com.ar",
        name: "Nicolas Perez"
    },
    /************************************************************************/
    /*                               General                                */
    /************************************************************************/
    site: {
        titulo: "Bienvenido",
        email_encode: "&#105;&#110;&#102;&#111;&#064;&#102;&#111;&#114;&#109;&#097;&#116;&#101;&#100;&#105;&#103;&#105;&#116;&#097;&#108;&#046;&#099;&#111;&#109;",
        email: "info@formatedigital.com",
        /*Default, mostrado al instalar nada mas*/
        menu: {
            'Home': '/',
            'About': '/about',
            'Contact': '/contact'
        }
    },
    settings: {
        name: "f-config.json", /*Archivo de configuracion del sitio*/
        path: "config/"
    },
    database: {
  		"host": "mongodb://127.0.0.1:27017/formate_digital_v1_Test"
  	},
    routes: {
        root: '/',
        install: '/install',
        login: '/login',
        register: '/register',
        forgot: '/forgot'
    },
    actions: {
        /*Acciones que se pueden realizar en el sitio */
        add: '/add',
        /*No requiere un slash*/
        mod: 'mod',
        del: '/del',
        block: '/block'
    },
    /************************************************************************/
    /*                                 API                                  */
    /************************************************************************/
    api:{
      versions:{
        'Pre-Production': '/v1', 'Version 2': '/v2'
      },
      header:{
        general: {
          key: "fd01-auth",
          value: "ba6a5Am$%1151"
        }
      }
    },
    /************************************************************************/
    /*                             Directories                              */
    /*                  Usados para la subida de archivos                   */
    /************************************************************************/
    public:{
      /*El Path pasa de ser /img => /public/img */
      img: "/img",
      js: "/js",
      demos: "/img/games-demos"
    },
    games: {
        root: '/games',
        upload_dir: 'uploads/games/',
        upload_format: "zip",
        /*Deberia ser /uploads/games/my_game/thumbnail.png*/
        thumbnail_path: "thumbnail.png"
    },
    escuelas: {
        root: '/escuelas',
        upload_dir: 'uploads/escuelas/',
        upload_format: '.png'
    },
    profesores: {
        root: '/profesores',
        upload_dir: 'uploads/profesores/',
        upload_format: '.png'
    },
    alumnos: {
        root: '/alumnos',
        upload_dir: 'uploads/alumnos/',
        upload_format: '.png'
    },
    /************************************************************************/
    /*                          Keys and passwords                          */
    /*                         Override in f-config                         */
    /************************************************************************/
    security: {
        /*Usado para encriptar datos sensibles en el front-end, no alterar una vez seteado*/
        crypto: {
            algorithm: 'aes-256-ctr',
            password: '!"#‼$%7≈V9"'
        },
        session: {
            name: "server-session",
            secret: "#$%&A/SD()=?AGA¦"
        },
        cookies: {
            secretKey: "uv2JnypefWr3WfyragYRrVMwxx2S",
            encryptKey: "hfxyMyrf58zPvtylCki0",
            defaultName: "formatedigital_cookie"
        }
    },
    /************************************************************************/
    /*                                Install                               */
    /*        Paths y datos de prueba para la instalacion del sistema       */
    /************************************************************************/
    install: {
        routes: {
            install: "/install",
            success: "/success",
            fail: "/fail"
        },
        credenciales: {
            administrador: {
                usuario: "administrador",
                password: "administrador123"
            },
            colegio: {
                nombre: "colegio"
            },
            profesor: {
                usuario: "profesor",
                password: "profesor123"
            },
            grado: {
                nombre: "grado"
            },
            alumno: {
                usuario: "alumno123",
                password: "alumno123"
            }
        }
    }

};
