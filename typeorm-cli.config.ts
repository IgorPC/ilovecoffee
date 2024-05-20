import { CoffeeRefractor1716237856774 } from "src/migrations/1716237856774-CoffeeRefractor";
import { DataSource } from "typeorm";

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'pass123',
    database: 'postgres',
    entities: [],
    migrations: [CoffeeRefractor1716237856774],
  });