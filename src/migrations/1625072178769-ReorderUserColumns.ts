import { MigrationInterface, QueryRunner } from "typeorm";

export class ReorderUserColumns1625072178769 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user RENAME TO user_old`);
        await queryRunner.query(`
            CREATE TABLE user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstname VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                otp VARCHAR(255),
                welcomeEmailSent BOOLEAN DEFAULT FALSE,
                isVerified BOOLEAN DEFAULT FALSE
            )
        `);
        await queryRunner.query(`
            INSERT INTO user (id, firstname, email, password, otp, welcomeEmailSent, isVerified)
            SELECT id, firstname, email, password, otp, welcomeEmailSent, isVerified
            FROM user_old
        `);
        await queryRunner.query(`DROP TABLE user_old`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user RENAME TO user_new`);
        await queryRunner.query(`
            CREATE TABLE user_old (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstname VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                otp VARCHAR(255),
                welcomeEmailSent BOOLEAN DEFAULT FALSE,
                isVerified BOOLEAN DEFAULT FALSE
            )
        `);
        await queryRunner.query(`
            INSERT INTO user_old (id, firstname, email, password, otp, welcomeEmailSent, isVerified)
            SELECT id, firstname, email, password, otp, welcomeEmailSent, isVerified
            FROM user
        `);
        await queryRunner.query(`DROP TABLE user`);
        await queryRunner.query(`ALTER TABLE user_old RENAME TO user`);
    }
}
