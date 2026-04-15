# CareLink Platform - Git Commit Script for Payment Integration & CI/CD (PowerShell)
# This script stages and commits all changes related to the payment integration and CI/CD setup

$ErrorActionPreference = "Stop"

Write-Host "🚀 CareLink Platform - Payment Integration & CI/CD Commit" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Git repository not found. Please initialize git first:" -ForegroundColor Red
    Write-Host "   git init"
    Exit 1
}

# Show current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current Branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# List files to be staged
Write-Host "📦 Files to be staged:" -ForegroundColor Blue
Write-Host "---"

Write-Host "✅ Backend Changes:"
Write-Host "   - backend\Services\PaymentService\Controllers\PaymentController.cs"
Write-Host "   - backend\Services\PaymentService\DTOs\CheckoutSessionResponse.cs"
Write-Host "   - backend\Services\PaymentService\DTOs\CreateCheckoutSessionRequest.cs"

Write-Host "✅ Frontend Changes:"
Write-Host "   - frontend\src\features\payment\pages\PaymentPage.jsx"
Write-Host "   - frontend\src\features\payment\pages\PaymentSuccessPage.jsx"
Write-Host "   - frontend\src\features\payment\pages\PaymentCancelPage.jsx"
Write-Host "   - frontend\src\features\payment\api\paymentApi.js"

Write-Host "✅ CI/CD Pipelines:"
Write-Host "   - .github\workflows\backend.yml"
Write-Host "   - .github\workflows\frontend.yml"
Write-Host "   - .github\workflows\deploy.yml"

Write-Host "✅ Documentation:"
Write-Host "   - PAYMENT_INTEGRATION.md"
Write-Host "   - CI_CD_SETUP.md"
Write-Host "   - IMPLEMENTATION_SUMMARY.md"

Write-Host ""
Write-Host "---"
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to stage these changes? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Commit cancelled"
    Exit 0
}

Write-Host ""
Write-Host "📝 Staging files..."

# Stage backend changes
git add "backend\Services\PaymentService\Controllers\PaymentController.cs" 2>$null
git add "backend\Services\PaymentService\DTOs\*.cs" 2>$null

# Stage frontend changes
git add "frontend\src\features\payment\pages\*.jsx" 2>$null
git add "frontend\src\features\payment\api\*.js" 2>$null

# Stage CI/CD files
git add ".github\workflows\*.yml" 2>$null

# Stage documentation
git add "PAYMENT_INTEGRATION.md" 2>$null
git add "CI_CD_SETUP.md" 2>$null
git add "IMPLEMENTATION_SUMMARY.md" 2>$null

Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Show git status
Write-Host "📊 Git Status:" -ForegroundColor Blue
Write-Host "---"
git status --short
Write-Host "---"
Write-Host ""

# Commit message
$commitMessage = @"
feat: implement Stripe payment integration and CI/CD pipelines

- Add CheckoutSessionResponse DTO for Stripe session responses
- Enhance CreateCheckoutSessionRequest with full feature support
- Implement complete CreateSession endpoint with error handling
- Update PaymentPage component with proper payment flow
- Enhance PaymentSuccessPage with payment details retrieval
- Improve PaymentCancelPage with better UX
- Enhance payment API service with better error handling
- Add GitHub Actions CI/CD pipelines:
  * Backend: Build, test, security scan, Docker build
  * Frontend: Build, test, security scan, Lighthouse audit
  * Deployment: Kubernetes deployment with auto-rollback
- Add comprehensive documentation:
  * PAYMENT_INTEGRATION.md: Payment flow and implementation guide
  * CI_CD_SETUP.md: CI/CD pipeline setup and configuration
  * IMPLEMENTATION_SUMMARY.md: Complete change summary

Features:
- Stripe checkout session creation
- Payment record persistence
- Secure payment processing
- Transaction tracking
- Error handling and validation
- JWT authentication
- Request ID tracing
- Webhook ready implementation

CI/CD:
- Automated backend testing and building
- Automated frontend testing and building
- Security vulnerability scanning
- Docker image building
- Kubernetes deployment automation
- Health checks and smoke tests
- Auto-rollback on failure
"@

Write-Host "💬 Commit Message:" -ForegroundColor Blue
Write-Host "---"
Write-Host $commitMessage
Write-Host "---"
Write-Host ""

# Ask for confirmation to commit
$confirmCommit = Read-Host "Proceed with commit? (yes/no)"

if ($confirmCommit -ne "yes") {
    Write-Host "❌ Commit cancelled"
    Write-Host "Files remain staged. You can commit manually with:"
    Write-Host "  git commit -m 'Your message here'"
    Exit 0
}

# Create commit
Write-Host ""
Write-Host "🔄 Creating commit..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host ""
Write-Host "✅ Commit successful!" -ForegroundColor Green
Write-Host ""

# Show commit info
Write-Host "📋 Commit Details:" -ForegroundColor Blue
git log -1 --pretty=format:"%H%n%an <%ae>%n%ad%n%s%n%b" --date=iso

Write-Host ""
Write-Host "🎉 Ready to push!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review the commit: git show"
Write-Host "2. Push to remote:   git push origin $currentBranch"
Write-Host "3. Create PR on GitHub"
Write-Host ""
Write-Host "Or push directly with:"
Write-Host "  git push origin $currentBranch"
