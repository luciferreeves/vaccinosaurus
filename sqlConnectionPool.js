const mariadb = require('mariadb');
const dotenv = require('dotenv');
dotenv.config();

/**
 * @export
 * @class SQLConnectionPool
 */

 module.exports = class SQLConnectionPool {

    static connectionPool = null;

    static createConnectionPool() {
        if (!this.connectionPool) {
            const host = `${process.env.DB_ADDRESS}`;
            const user = process.env.DB_USER;
            const password = `${process.env.DB_PASSWORD}`;
            const database = process.env.DB_DATABASE;

            this.connectionPool = mariadb.createPool({
                host,
                user,
                password,
                database,
                connectionLimit: 32,
                multipleStatements: true
            });
        }

        return this.connectionPool;
    }

}
