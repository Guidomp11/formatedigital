/*Menus disponibles para la seccion de un usuario logeado*/

module.exports = {

    /**
     * Genera la estructura para un menu de usuario normal
     * @param privilege Nivel de privilegio del usuario, usado para identificar la seccion (Administrador en este caso)
     * @param id Id del usuario para la autorizacion previa del enlace
     */
    profile: function(privilege, id, text) {
        return [{
                link: "/" + privilege + "/" + id + "/profile",
                option: text("profile")
            }, {
                link: "/" + privilege + "/" + id + "/settings",
                option: text("settings")
            }
            /*,
                        {
                            link: "/" + privilege + "/" + id + "/stats",
                            option: "Stats"
                        }*/
        ]
    }
}
