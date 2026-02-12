import { Sequelize, QueryTypes } from 'sequelize';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = require('./config/database');

const sequelize = new Sequelize(dbConfig);

async function checkUnaccent() {
    try {
        const result = await sequelize.query("SELECT * FROM pg_extension WHERE extname = 'unaccent';", {
            type: QueryTypes.SELECT
        });

        if (result.length > 0) {
            console.log("Extension 'unaccent' exists.");
        } else {
            console.log("Extension 'unaccent' DOES NOT exist.");
        }
    } catch (error) {
        console.error("Error checking extension:", error);
    } finally {
        await sequelize.close();
    }
}

checkUnaccent();
