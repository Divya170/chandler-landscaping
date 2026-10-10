import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 120, default: 'Admin' })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
