export const KENYAN_COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a',
    'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia',
    'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const SECTORS = [
    'Agriculture & Food Security',
    'Education',
    'Health',
    'Water & Sanitation',
    'Environment & Climate',
    'Gender & Women Empowerment',
    'Youth Development',
    'Child Protection',
    'Disability & Inclusion',
    'Economic Development',
    'Governance & Human Rights',
    'Peace & Conflict Resolution',
    'Arts & Culture',
    'Technology & Innovation',
    'Emergency Response',
];

export const STAFF_SIZES = [
    '1-5',
    '6-10',
    '11-25',
    '26-50',
    '51-100',
    '100+',
];

export const BUDGET_RANGES = [
    'Under 500K',
    '500K - 1M',
    '1M - 5M',
    '5M - 10M',
    '10M - 50M',
    '50M+',
];

export const SDGS = [
    { id: 1, name: 'No Poverty' },
    { id: 2, name: 'Zero Hunger' },
    { id: 3, name: 'Good Health and Well-being' },
    { id: 4, name: 'Quality Education' },
    { id: 5, name: 'Gender Equality' },
    { id: 6, name: 'Clean Water and Sanitation' },
    { id: 7, name: 'Affordable and Clean Energy' },
    { id: 8, name: 'Decent Work and Economic Growth' },
    { id: 9, name: 'Industry, Innovation and Infrastructure' },
    { id: 10, name: 'Reduced Inequalities' },
    { id: 11, name: 'Sustainable Cities and Communities' },
    { id: 12, name: 'Responsible Consumption and Production' },
    { id: 13, name: 'Climate Action' },
    { id: 14, name: 'Life Below Water' },
    { id: 15, name: 'Life on Land' },
    { id: 16, name: 'Peace, Justice and Strong Institutions' },
    { id: 17, name: 'Partnerships for the Goals' },
];

export const TIER_FEATURES = {
    BASIC_FREE: {
        name: 'Basic Free',
        price: 0,
        features: [
            'Basic profile listing',
            'Organization name and description',
            'Contact information',
            'Sector tags (up to 3)',
            'Location (county)',
        ],
    },
    SELF_ASSESSMENT: {
        name: 'Self-Assessment',
        price: 2500,
        features: [
            'Everything in Basic',
            'Extended profile details',
            'Document uploads (up to 5)',
            'Unlimited sector tags',
            'SDG alignment display',
            'Website and social links',
            'Self-assessment badge',
        ],
    },
    DARAJA_VERIFIED: {
        name: 'Daraja Verified',
        price: 10000,
        features: [
            'Everything in Self-Assessment',
            'Manual verification by Daraja team',
            'Premium verified badge',
            'Featured in search results',
            'Priority support',
            'Unlimited document uploads',
            'Analytics dashboard',
        ],
    },
};
