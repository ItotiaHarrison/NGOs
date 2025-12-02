import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);

        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv';

        // Fetch all organizations with user data
        const organizations = await prisma.organization.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (format === 'csv') {
            const csv = generateCSV(organizations);

            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="daraja-directory-${Date.now()}.csv"`,
                },
            });
        } else if (format === 'pdf') {
            // For PDF, we'll generate a simple HTML that can be printed as PDF
            const html = generatePDFHTML(organizations);

            return new NextResponse(html, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Content-Disposition': `inline; filename="daraja-directory-${Date.now()}.html"`,
                },
            });
        }

        return NextResponse.json(
            { error: 'Invalid format' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Export failed' },
            { status: 500 }
        );
    }
}

function generateCSV(organizations: any[]): string {
    const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'County',
        'Sub-County',
        'Tier',
        'Verification Status',
        'Sectors',
        'Staff Size',
        'Annual Budget',
        'Year Established',
        'Website',
        'Registration Number',
        'User Email',
        'View Count',
        'Created At',
    ];

    const rows = organizations.map((org) => [
        org.id,
        org.name,
        org.email,
        org.phone,
        org.county,
        org.subCounty || '',
        org.tier,
        org.verificationStatus,
        org.sectors.join('; '),
        org.staffSize || '',
        org.annualBudget || '',
        org.yearEstablished || '',
        org.website || '',
        org.registrationNumber || '',
        org.user.email,
        org.viewCount,
        new Date(org.createdAt).toISOString(),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
    ].join('\n');

    return csvContent;
}

function generatePDFHTML(organizations: any[]): string {
    const rows = organizations.map((org) => `
    <tr>
      <td>${org.name}</td>
      <td>${org.county}</td>
      <td>${org.tier.replace('_', ' ')}</td>
      <td>${org.verificationStatus}</td>
      <td>${org.sectors.slice(0, 2).join(', ')}${org.sectors.length > 2 ? '...' : ''}</td>
      <td>${org.viewCount}</td>
    </tr>
  `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Daraja Directory Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
        h1 {
          color: #16a34a;
          margin-bottom: 10px;
        }
        .meta {
          color: #666;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #16a34a;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { margin: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Daraja Directory - Organizations Report</h1>
      <div class="meta">
        Generated: ${new Date().toLocaleString()}<br>
        Total Organizations: ${organizations.length}
      </div>
      
      <button onclick="window.print()" style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
        Print / Save as PDF
      </button>
      
      <table>
        <thead>
          <tr>
            <th>Organization Name</th>
            <th>County</th>
            <th>Tier</th>
            <th>Status</th>
            <th>Sectors</th>
            <th>Views</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Daraja Directory - Connecting NGOs & CBOs with Funders</p>
        <p>© ${new Date().getFullYear()} Daraja Directory. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}
