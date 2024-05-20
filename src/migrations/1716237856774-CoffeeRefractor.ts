import { MigrationInterface, QueryRunner } from "typeorm";

export class CoffeeRefractor1716237856774 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`
        )
    }

}
