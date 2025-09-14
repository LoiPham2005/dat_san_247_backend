// filepath: d:\learn_programming\dat_san_24_7_app\dat_san_247_backend\src\database\migrations\create-roles-table.ts
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateRolesTable implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng roles
        await queryRunner.createTable(
            new Table({
                name: 'roles',
                columns: [
                    {
                        name: 'role_id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
        );

        // Thêm role_id vào bảng users
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'role_id',
                type: 'int',
                isNullable: false, // Thêm dòng này
            }),
        );

        // Tạo foreign key
        await queryRunner.createForeignKey(
            'users',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['role_id'],
                referencedTableName: 'roles',
                onDelete: 'SET NULL',
            }),
        );

        // Insert default roles
        await queryRunner.query(`
            INSERT INTO roles (name, description) VALUES
            ('admin', 'Administrator with full access'),
            ('user', 'Regular user'),
            ('venue_owner', 'Venue owner/manager');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users', 'FK_users_role_id');
        await queryRunner.dropColumn('users', 'role_id');
        await queryRunner.dropTable('roles');
    }
}