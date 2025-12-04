#!/usr/bin/env node

/**
 * Seed script runner for ticketing data
 * Run with: node scripts/seed-ticketing.js
 */

import { seedTicketingData } from '../src/lib/seed-ticketing-data.js';

seedTicketingData();
