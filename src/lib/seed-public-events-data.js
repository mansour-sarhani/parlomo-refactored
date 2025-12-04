/**
 * @fileoverview Seed Public Events Data
 * Populates the MongoDB database with sample public events for testing
 */

import {
    createPublicEvent,
    resetAllPublicEventsData,
    getAllPublicEvents,
} from './public-events-db';

/**
 * Seed sample public events
 * Creates 10 diverse sample events across different categories
 * @returns {Promise<Array>} Array of created events
 */
export async function seedPublicEvents() {
    console.log('🌱 Seeding public events data...');

    // Reset existing data
    await resetAllPublicEventsData();

    const sampleEvents = [
        // 1. Concert - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L8', // Example Clerk/Auth ID
            title: 'Summer Music Festival 2025',
            description: '<p>Join us for the biggest music festival of the summer! Featuring top artists from around the world, multiple stages, and unforgettable performances.</p><p>Lineup includes headliners and emerging artists across rock, pop, electronic, and indie genres.</p><p><strong>What to expect:</strong></p><ul><li>3 days of non-stop music</li><li>Food trucks and craft beer gardens</li><li>Camping facilities available</li><li>Meet & greet opportunities</li></ul>',
            category: 'festival',
            tags: ['music', 'outdoor', 'summer', 'festival'],
            startDate: new Date('2025-07-15T16:00:00Z'),
            endDate: new Date('2025-07-17T23:00:00Z'),
            // bookingDeadline: '2025-07-14T23:59:59Z', // Not in schema
            timezone: 'Europe/London',
            doorsOpen: new Date('2025-07-15T15:00:00Z'),
            venue: {
                name: 'Hyde Park',
                capacity: 50000
            },
            location: {
                address: 'Hyde Park',
                city: 'London',
                state: 'England',
                country: 'United Kingdom',
                postcode: 'W2 2UH',
                coordinates: {
                    lat: 51.5074,
                    lng: -0.1657
                }
            },
            eventType: 'general_admission',
            globalCapacity: 50000,
            currency: 'GBP',
            // serviceCharge: 2.50, // Not in schema directly, maybe platformFeePercentage?
            // serviceChargeType: 'fixed',
            waitlistEnabled: true,
            organizer: {
                name: 'Summer Sounds Productions',
                email: 'info@summersounds.com',
                phone: '+44 20 7946 0958',
                website: 'https://summersounds.com',
                // Facebook/Insta/WhatsApp not in schema sub-object, maybe put in description or metadata?
            },
            coverImage: '/images/events/summer-festival.jpg',
            galleryImages: [],
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            status: 'published',
            // isPublic: true, // Not in schema, status implies visibility
            // isOnline: false, // Not in schema, inferred from location? Or maybe add to schema?
            ageRestriction: 0, // 0 for all ages
            refundPolicy: '<p><strong>Refund Policy:</strong></p><ul><li>Full refund up to 30 days before the event</li><li>50% refund up to 7 days before</li><li>No refunds within 7 days of the event</li></ul><p>All refunds processed within 5-10 business days.</p>',
            termsAndConditions: 'No outside food or beverages. Bag checks at entry. Rain or shine event.',
            taxRate: 20,
        },

        // 2. Conference - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L8',
            title: 'Tech Innovation Summit 2025',
            description: '<p>The premier technology conference bringing together industry leaders, innovators, and entrepreneurs.</p><p>Topics include AI, blockchain, cloud computing, and the future of technology.</p>',
            category: 'conference',
            tags: ['technology', 'innovation', 'networking', 'business'],
            startDate: new Date('2025-09-20T09:00:00Z'),
            endDate: new Date('2025-09-22T18:00:00Z'),
            timezone: 'America/New_York',
            doorsOpen: new Date('2025-09-20T08:00:00Z'),
            venue: {
                name: 'Javits Center',
                capacity: 5000
            },
            location: {
                address: '429 11th Ave',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postcode: '10001',
                coordinates: {
                    lat: 40.7559,
                    lng: -74.0020
                }
            },
            eventType: 'general_admission',
            globalCapacity: 5000,
            currency: 'GBP',
            waitlistEnabled: true,
            organizer: {
                name: 'TechEvents Global',
                email: 'contact@techevents.com',
                phone: '+1-212-555-0200',
                website: 'https://techinnovationsummit.com',
            },
            coverImage: '/images/events/tech-summit.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 18,
            refundPolicy: 'Tickets are non-refundable but transferable.',
            termsAndConditions: 'Professional attire recommended. Photography allowed.',
            taxRate: 8.875,
        },

        // 3. Workshop - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L9',
            title: 'Photography Masterclass: Portrait Lighting',
            description: '<p>Learn professional portrait lighting techniques from award-winning photographer Sarah Chen.</p><p>Hands-on workshop with live models and professional equipment.</p>',
            category: 'workshop',
            tags: ['photography', 'education', 'creative', 'hands-on'],
            startDate: new Date('2025-06-10T10:00:00Z'),
            endDate: new Date('2025-06-10T17:00:00Z'),
            timezone: 'America/Los_Angeles',
            doorsOpen: new Date('2025-06-10T09:30:00Z'),
            venue: {
                name: 'Creative Arts Studio',
                capacity: 25
            },
            location: {
                address: '1234 Market Street',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                postcode: '94102',
                coordinates: {
                    lat: 37.7749,
                    lng: -122.4194
                }
            },
            eventType: 'general_admission',
            globalCapacity: 25,
            currency: 'GBP',
            waitlistEnabled: true,
            organizer: {
                name: 'Sarah Chen Photography',
                email: 'sarah@sarahchen.com',
                phone: '+1-415-555-0300',
                website: 'https://sarahchen.com',
            },
            coverImage: '/images/events/photo-workshop.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 16,
            refundPolicy: 'Full refund up to 14 days before the workshop.',
            termsAndConditions: 'Bring your own camera. All skill levels welcome.',
            taxRate: 8.5,
        },

        // 4. Comedy Show - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L9',
            title: 'Stand-Up Comedy Night: Laugh Out Loud',
            description: '<p>An evening of non-stop laughter with top comedians from across the country!</p><p>Featuring headliner Mike Johnson and special guests.</p>',
            category: 'comedy',
            tags: ['comedy', 'entertainment', 'nightlife'],
            startDate: new Date('2025-05-25T20:00:00Z'),
            endDate: new Date('2025-05-25T23:00:00Z'),
            timezone: 'America/Chicago',
            doorsOpen: new Date('2025-05-25T19:00:00Z'),
            venue: {
                name: 'The Laugh Factory',
                capacity: 300
            },
            location: {
                address: '3175 N Broadway',
                city: 'Chicago',
                state: 'IL',
                country: 'USA',
                postcode: '60657',
                coordinates: {
                    lat: 41.9391,
                    lng: -87.6456
                }
            },
            eventType: 'general_admission',
            globalCapacity: 300,
            currency: 'GBP',
            waitlistEnabled: false,
            organizer: {
                name: 'Comedy Central Productions',
                email: 'events@comedycentral.com',
                phone: '+1-312-555-0400',
                website: 'https://laughfactory.com',
            },
            coverImage: '/images/events/comedy-night.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 21,
            refundPolicy: 'No refunds. All sales final.',
            termsAndConditions: 'Two-drink minimum. No heckling.',
            taxRate: 10.25,
        },

        // 5. Charity Event - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L0',
            title: 'Charity Gala: Hope for Tomorrow',
            description: '<p>Join us for an elegant evening supporting children\'s education programs.</p><p>Includes dinner, live auction, and performances by local artists.</p>',
            category: 'charity',
            tags: ['charity', 'fundraising', 'gala', 'formal'],
            startDate: new Date('2025-10-05T18:00:00Z'),
            endDate: new Date('2025-10-05T23:00:00Z'),
            timezone: 'America/New_York',
            doorsOpen: new Date('2025-10-05T17:30:00Z'),
            venue: {
                name: 'Grand Ballroom Hotel Plaza',
                capacity: 500
            },
            location: {
                address: '768 5th Ave',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postcode: '10019',
                coordinates: {
                    lat: 40.7614,
                    lng: -73.9776
                }
            },
            eventType: 'seated',
            globalCapacity: 500,
            currency: 'GBP',
            waitlistEnabled: true,
            organizer: {
                name: 'Hope Foundation',
                email: 'gala@hopefoundation.org',
                phone: '+1-212-555-0500',
                website: 'https://hopefoundation.org',
            },
            coverImage: '/images/events/charity-gala.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 18,
            refundPolicy: 'Tax-deductible donation. No refunds.',
            termsAndConditions: 'Black tie optional. Silent auction items available.',
            taxRate: 0,
        },

        // 6. Sports Event - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L0',
            title: 'City Marathon 2025',
            description: '<p>Annual city marathon featuring 5K, 10K, half marathon, and full marathon distances.</p><p>All proceeds support local youth sports programs.</p>',
            category: 'sports',
            tags: ['running', 'marathon', 'fitness', 'charity'],
            startDate: new Date('2025-11-15T07:00:00Z'),
            endDate: new Date('2025-11-15T14:00:00Z'),
            timezone: 'America/Los_Angeles',
            doorsOpen: new Date('2025-11-15T06:00:00Z'),
            venue: {
                name: 'City Hall Plaza',
                capacity: 10000
            },
            location: {
                address: '1 Dr Carlton B Goodlett Pl',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                postcode: '94102',
                coordinates: {
                    lat: 37.7790,
                    lng: -122.4195
                }
            },
            eventType: 'general_admission',
            globalCapacity: 10000,
            currency: 'GBP',
            waitlistEnabled: true,
            organizer: {
                name: 'City Sports Association',
                email: 'info@citymarathon.com',
                phone: '+1-415-555-0600',
                website: 'https://citymarathon.com',
            },
            coverImage: '/images/events/marathon.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 0,
            refundPolicy: 'No refunds after registration closes.',
            termsAndConditions: 'Medical clearance recommended. Water stations provided.',
            taxRate: 8.5,
        },

        // 7. Theater - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L1',
            title: 'Shakespeare in the Park: A Midsummer Night\'s Dream',
            description: '<p>Classic Shakespeare comedy performed under the stars in Central Park.</p><p>Bring blankets and picnic baskets for this magical outdoor theater experience.</p>',
            category: 'theater',
            tags: ['theater', 'shakespeare', 'outdoor', 'culture'],
            startDate: new Date('2025-08-01T19:30:00Z'),
            endDate: new Date('2025-08-01T22:00:00Z'),
            timezone: 'America/New_York',
            doorsOpen: new Date('2025-08-01T18:30:00Z'),
            venue: {
                name: 'Delacorte Theater, Central Park',
                capacity: 1800
            },
            location: {
                address: 'Central Park West & 81st St',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postcode: '10024',
                coordinates: {
                    lat: 40.7794,
                    lng: -73.9632
                }
            },
            eventType: 'general_admission',
            globalCapacity: 1800,
            currency: 'GBP',
            waitlistEnabled: false,
            organizer: {
                name: 'Public Theater',
                email: 'tickets@publictheater.org',
                phone: '+1-212-555-0700',
                website: 'https://publictheater.org',
            },
            coverImage: '/images/events/shakespeare-park.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 0,
            refundPolicy: 'Free event - no refunds applicable.',
            termsAndConditions: 'Weather permitting. Bring your own seating.',
            taxRate: 0,
        },

        // 8. Networking Event - Future event
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L1',
            title: 'Startup Founders Meetup',
            description: '<p>Monthly networking event for startup founders, investors, and entrepreneurs.</p><p>Pitch sessions, panel discussions, and networking opportunities.</p>',
            category: 'networking',
            tags: ['startup', 'entrepreneurship', 'networking', 'business'],
            startDate: new Date('2025-06-18T18:00:00Z'),
            endDate: new Date('2025-06-18T21:00:00Z'),
            timezone: 'America/Los_Angeles',
            doorsOpen: new Date('2025-06-18T17:30:00Z'),
            venue: {
                name: 'Innovation Hub',
                capacity: 150
            },
            location: {
                address: '555 Mission St',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                postcode: '94105',
                coordinates: {
                    lat: 37.7886,
                    lng: -122.3978
                }
            },
            eventType: 'general_admission',
            globalCapacity: 150,
            currency: 'GBP',
            waitlistEnabled: true,
            organizer: {
                name: 'Startup Community SF',
                email: 'hello@startupsf.com',
                phone: '+1-415-555-0800',
                website: 'https://startupsf.com',
            },
            coverImage: '/images/events/startup-meetup.jpg',
            galleryImages: [],
            videoUrl: null,
            status: 'published',
            ageRestriction: 18,
            refundPolicy: 'Full refund up to 48 hours before event.',
            termsAndConditions: 'Bring business cards. Pitch deck submissions welcome.',
            taxRate: 8.5,
        },

        // 9. Draft Event - Not published
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L8',
            title: 'Winter Wonderland Concert Series',
            description: '<p>Holiday concert series featuring classical and contemporary music.</p>',
            category: 'concert',
            tags: ['music', 'holiday', 'winter'],
            startDate: new Date('2025-12-20T19:00:00Z'),
            endDate: new Date('2025-12-20T22:00:00Z'),
            timezone: 'America/New_York',
            doorsOpen: new Date('2025-12-20T18:00:00Z'),
            venue: {
                name: 'Carnegie Hall',
                capacity: 2800
            },
            location: {
                address: '881 7th Ave',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postcode: '10019',
                coordinates: {
                    lat: 40.7651,
                    lng: -73.9799
                }
            },
            eventType: 'seated',
            globalCapacity: 2800,
            currency: 'GBP',
            waitlistEnabled: false,
            organizer: {
                name: 'Classical Music Society',
                email: 'info@classicalmusic.org',
                phone: '+1-212-555-0900',
                website: null,
            },
            coverImage: null,
            galleryImages: [],
            videoUrl: null,
            status: 'draft',
            ageRestriction: 0,
            refundPolicy: null,
            termsAndConditions: null,
            taxRate: 8.875,
        },

        // 10. Online Event - Virtual conference
        {
            organizerId: 'user_2pK7Xq9Y5Z8W3V1j4M6N0r2L9',
            title: 'Global Web Development Conference 2025',
            description: '<p>Virtual conference featuring the latest in web development, frameworks, and best practices.</p><p>Join developers from around the world online!</p>',
            category: 'conference',
            tags: ['webdev', 'online', 'technology', 'virtual'],
            startDate: new Date('2025-07-10T14:00:00Z'),
            endDate: new Date('2025-07-12T20:00:00Z'),
            timezone: 'UTC',
            doorsOpen: null,
            venue: {
                name: 'Online Event',
                capacity: 10000
            },
            location: {
                address: 'Virtual',
                city: 'Online',
                state: 'N/A',
                country: 'Global',
                postcode: '00000',
                coordinates: {
                    lat: 0,
                    lng: 0
                }
            },
            eventType: 'general_admission',
            globalCapacity: 10000,
            currency: 'GBP',
            waitlistEnabled: false,
            organizer: {
                name: 'WebDev Global',
                email: 'info@webdevglobal.com',
                phone: null,
                website: 'https://webdevglobal.com',
            },
            coverImage: '/images/events/webdev-conf.jpg',
            galleryImages: [],
            videoUrl: 'https://youtube.com/watch?v=example',
            status: 'published',
            ageRestriction: 0,
            refundPolicy: 'Full refund up to 7 days before the event.',
            termsAndConditions: 'Zoom link will be sent 24 hours before the event.',
            taxRate: 0,
        },
    ];

    // Create all sample events
    const createdEvents = [];
    for (const eventData of sampleEvents) {
        const event = await createPublicEvent(eventData);
        createdEvents.push(event);
    }

    console.log(`✅ Created ${createdEvents.length} sample public events`);

    return createdEvents;
}

/**
 * Get seed data summary
 */
export async function getSeedSummary() {
    const events = await getAllPublicEvents();
    const eventsArray = Object.values(events);

    return {
        total: eventsArray.length,
        published: eventsArray.filter(e => e.status === 'published').length,
        draft: eventsArray.filter(e => e.status === 'draft').length,
        // online: eventsArray.filter(e => e.isOnline).length, // isOnline is virtual or derived
        byCategory: eventsArray.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
        }, {}),
    };
}

