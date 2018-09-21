const { aql } = require('arangojs');
const { query, querySingle } = require('../data/repository');

class Users {
    constructor(value) {
        this._key = value._key;
        this.username = value.username;
        this.firstname = value.firstname;
        this.lastname = value.lastname;

        this.toJSON = this.toJSON.bind(this);
    }

    static async find() {
        return await query(aql `FOR u IN user RETURN u`, this.create);
    }

    static async findById(username) {
        return await querySingle(aql `FOR u IN user FILTER u.username == ${username} RETURN u`, this.create);
    }

    static create(v) { return new Users(v); }

    toJSON() {
        return {
            _key: this._key,
            username: this.username,
            firstname: this.firstname,
            lastname: this.lastname
        };
    }
}

module.exports = Users;