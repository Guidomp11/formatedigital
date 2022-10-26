const Config = rootRequire('config');
const Singleton = require('./Singleton');

class Usuario extends Singleton {
    constructor() {
        super();
    }

    Init(id, username, grado, privilege, profileMenu, profilePicture, auth, settings) {
        this.id = id;
        this.username = username;
        this.grado = grado;
        this.privilege = privilege;
        this.profileMenu = profileMenu;
        this.profilePicture = profilePicture;
        this.auth = auth;
        this.settings = settings;
    }

    Reset() {
        delete this.id;
        delete this.username;
        delete this.grado;
        delete this.privilege;
        delete this.profileMenu;
        delete this.profilePicture;
        delete this.auth;
        delete this.settings;
    }

    //Getters

    getId() {
        return this.id;
    }

    getGrado() {
        return this.grado;
    }

    getUserName() {
        return this.username;
    }

    getPrivilege() {
        return this.privilege;
    }

    getMenu() {
        return this.menu;
    }

    getProfileMenu() {
        return this.profileMenu;
    }

    getProfilePicture() {
        return this.profilePicture;
    }

    isAuth() {
        return this.auth;
    }

    getGameId() {
        return this.gameId;
    }

    getSettings() {
        return this.settings;
    }

    //Setter

    setGameId(gameId) {
        this.gameId = gameId;
    }

    setProfileMenu(profileMenu) {
        this.profileMenu = profileMenu;
    }

    setGrado(grado) {
        this.grado = grado;
    }

    setSettings(settings) {
        this.settings = settings;
    }
}


module.exports = Usuario.GetInstance;
