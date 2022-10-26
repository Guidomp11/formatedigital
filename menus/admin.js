/*Menus disponibles para la seccion de administrador*/

module.exports = {

    /**
     * Genera la estructura para el menu de administracion que permite acceder a distintas secciones
     * @param privilege Nivel de privilegio del usuario, usado para identificar la seccion (Administrador en este caso)
     * @param text Objeto req.text (i18n) que permite buscar traducciones en los archivos de traduccion (i.e: locales/es.json)
     */
    main: function(privilege, text) {
        return [{
                link: "/" + privilege + "/dashboard",
                icon: "fa-dashboard",
                option: text("dashboard")
            }, {
                link: "/" + privilege + "/juegos",
                icon: "fa-gamepad",
                option: text("games")
            }, {
                link: "/" + privilege + "/colegios",
                icon: "fa-university",
                option: text("colleges")
            }, {
                link: "/" + privilege + "/profesores",
                icon: "fa-users",
                option: text("teachers")
            }, {
                link: "/" + privilege + "/grados",
                icon: "fa-star",
                option: text("grades")
            }, {
                link: "/" + privilege + "/alumnos",
                icon: "fa-child",
                option: text("alumns")
            },
            {
                link: "/" + privilege + "/admins",
                icon: "fa-user-secret",
                option: text("admins")
            },
            {
                link: "/" + privilege + "/settings",
                icon: "fa-cogs",
                option: text("settings")
            }
        ];
    },

    /**
     * Genera la estructura para un menu de usuario normal
     * @param privilege Nivel de privilegio del usuario, usado para identificar la seccion (Administrador en este caso)
     * @param id Id del usuario para la autorizacion previa del enlace
     */
    profile: function(privilege, id, text) {
        return [/*{
            link: "/" + privilege + "/" + id + "/profile",
            option: text("profile")
        },*/ {
            link: "/" + privilege + "/" + id + "/settings",
            option: text("settings")
        }]
    }
}
