// Script to create an admin user
// Run with: npx tsx scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = process.argv[2] || 'admin@daraja.org';
    const password = process.argv[3] || 'admin123';

    try {
        // Check if admin already exists
        const existing = await prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            console.log('❌ Admin user already exists with this email');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true,
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('User ID:', admin.id);
        console.log('\n⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
