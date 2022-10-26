/*Tareas a realizar*/

const TODO = {
    Installer: "OK",
    Settings cargados de la base de datos: "OK",
    Profesores: "OK",
    Grados: "OK",
    Alumnos: "OK",
    WARNING_NO_PAY: "Hacer un middleware o algo en routes para chequear si el colegio pago"
};

const BUGS = {
    TABLES_MOD: "No se puede modificar la cantidad de elemntos cuando se elimina un resultado (precargado), ahora se borran de la tabla pero no se actualiza el total",
    UPLOAD_PICTRE: "ALgo pasa con la subida de imagenes a la hora de procesar el PATH donde se guardan, las trata de ubicar en C:/ No pasa en todos los entornos",
    SETTINGS_CHANGE: "Al actualizar la configuracion no se recarga automaticamente, ya que esta en '.nodemonignore' la regla, porque sino cuando se crea crashea el proceso",
    SETTINGS_DB: "Ver de habilitar la opcion de ingresar la base de datos a la hora de installar, por ahora se pisan directo de default.js",
    ADMIN_COLEGIO: "SI no hay datos de contacto, flashea fuerte y rompe en el front-end",
    UPLOAD_GAME: "Cuando se sube un juego, a la hora de descomprimirlo deja una carpeta intermedia, ej: uploads/games/my_juego/my_juego/index.html, ver como omitir la intermedia."
}
