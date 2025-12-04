# MongoDB Migration - Batch Update API Routes
# This script helps update remaining API routes from JSON to MongoDB

Write-Host "MongoDB Migration - API Routes Batch Update" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$routesToUpdate = @(
    "src/app/api/public-events/[id]/stats/route.js",
    "src/app/api/public-events/[id]/publish/route.js",
    "src/app/api/public-events/[id]/unpublish/route.js",
    "src/app/api/public-events/[id]/cancel/route.js",
    "src/app/api/public-events/categories/route.js",
    "src/app/api/public-events/slug/[slug]/route.js",
    "src/app/api/seed-public-events/route.js",
    "src/app/api/reset-public-events/route.js",
    "src/app/api/ticketing/events/[eventId]/route.js",
    "src/app/api/ticketing/events/[eventId]/ticket-types/route.js",
    "src/app/api/ticketing/events/[eventId]/promo-codes/route.js",
    "src/app/api/ticketing/events/[eventId]/promo-codes/[codeId]/route.js",
    "src/app/api/ticketing/events/[eventId]/attendees/route.js",
    "src/app/api/ticketing/events/[eventId]/financials/route.js",
    "src/app/api/ticketing/checkout/start/route.js",
    "src/app/api/ticketing/checkout/complete/route.js",
    "src/app/api/ticketing/orders/[orderId]/route.js",
    "src/app/api/ticketing/orders/[orderId]/tickets/route.js",
    "src/app/api/ticketing/promo/validate/route.js",
    "src/app/api/ticketing/scanner/scan/route.js",
    "src/app/api/financials/settlements/route.js",
    "src/app/api/financials/settlements/[id]/route.js",
    "src/app/api/financials/settlements/admin/route.js",
    "src/app/api/financials/settlements/organizer/route.js",
    "src/app/api/financials/refunds/route.js",
    "src/app/api/financials/refunds/[id]/route.js",
    "src/app/api/financials/refunds/admin/route.js",
    "src/app/api/financials/refunds/organizer/route.js",
    "src/app/api/events/[eventName]/route.js"
)

Write-Host "Total routes to update: $($routesToUpdate.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Migration Steps for Each Route:" -ForegroundColor Green
Write-Host "1. Add: import { connectDB } from '@/lib/mongodb';" -ForegroundColor White
Write-Host "2. Change: '@/lib/mock-ticketing-db' -> '@/lib/ticketing-db'" -ForegroundColor White
Write-Host "3. Change: '@/lib/mock-public-events-db' -> '@/lib/public-events-db'" -ForegroundColor White
Write-Host "4. Add: await connectDB(); at start of each handler" -ForegroundColor White
Write-Host "5. Add: await to all database calls" -ForegroundColor White
Write-Host "6. Remove: parseInt() for MongoDB string IDs" -ForegroundColor White
Write-Host ""

Write-Host "Routes List:" -ForegroundColor Cyan
foreach ($route in $routesToUpdate) {
    Write-Host "  - $route" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Note: Manual review recommended for complex routes" -ForegroundColor Yellow
Write-Host "Completed routes: public-events/route.js, public-events/[id]/route.js, seed-ticketing/route.js" -ForegroundColor Green
