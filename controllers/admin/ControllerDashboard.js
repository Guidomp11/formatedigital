const Config = rootRequire('config');
const Functions = rootRequire('functions');

const View = rootPath() + 'views/admin/';

module.exports = {
    get: (req, res, general) => {
        //Genera  graficos con estadisticas generales (colegios, juegos, etc)
        general.statistics = {
            grados: {}
        };

        res.render(View + 'dashboard', general);
    }
}
