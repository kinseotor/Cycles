class DataBase {

    DATA_TYPE = null;
    _type = 'DataBase';
    _name = '';

    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }

    property = {}
    get property() {
        return this.property;
    }
    
}


export { DataBase };