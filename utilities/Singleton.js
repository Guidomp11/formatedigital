const singleton = Symbol('singleton');

class Singleton{
    static get GetInstance(){
        if(!this[singleton]){
            this[singleton] = new this;
        }
        return this[singleton];
    }
    
    constructor(){
        let Class = this.constructor;
        
        if(!Class[singleton]){
            Class[singleton] = this;
        }
        
        return Class[singleton];
    }
}

module.exports = Singleton;