#!/bin/bash
#
# CareLink Platform - Git Commit Script for Payment Integration & CI/CD
# This script stages and commits all changes related to the payment integration and CI/CD setup
#

set -e

echo "🚀 CareLink Platform - Payment Integration & CI/CD Commit"
echo "=========================================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Git repository not found. Please initialize git first:"
    echo "   git init"
    exit 1
fi

# Show current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current Branch: $CURRENT_BRANCH"
echo ""

# List files to be staged
echo "📦 Files to be staged:"
echo "---"

# Backend files
echo "✅ Backend Changes:"
echo "   - backend/Services/PaymentService/Controllers/PaymentController.cs"
echo "   - backend/Services/PaymentService/DTOs/CheckoutSessionResponse.cs"
echo "   - backend/Services/PaymentService/DTOs/CreateCheckoutSessionRequest.cs"

# Frontend files
echo "✅ Frontend Changes:"
echo "   - frontend/src/features/payment/pages/PaymentPage.jsx"
echo "   - frontend/src/features/payment/pages/PaymentSuccessPage.jsx"
echo "   - frontend/src/features/payment/pages/PaymentCancelPage.jsx"
echo "   - frontend/src/features/payment/api/paymentApi.js"

# CI/CD files
echo "✅ CI/CD Pipelines:"
echo "   - .github/workflows/backend.yml"
echo "   - .github/workflows/frontend.yml"
echo "   - .github/workflows/deploy.yml"

# Documentation
echo "✅ Documentation:"
echo "   - PAYMENT_INTEGRATION.md"
echo "   - CI_CD_SETUP.md"
echo "   - IMPLEMENTATION_SUMMARY.md"

echo ""
echo "---"
echo ""

# Ask for confirmation
read -p "Do you want to stage these changes? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Commit cancelled"
    exit 0
fi

echo ""
echo "📝 Staging files..."

# Stage backend changes
git add backend/Services/PaymentService/Controllers/PaymentController.cs || true
git add backend/Services/PaymentService/DTOs/*.cs || true

# Stage frontend changes
git add frontend/src/features/payment/pages/*.jsx || true
git add frontend/src/features/payment/api/*.js || true

# Stage CI/CD files
git add .github/workflows/*.yml || true

# Stage documentation
git add PAYMENT_INTEGRATION.md || true
git add CI_CD_SETUP.md || true
git add IMPLEMENTATION_SUMMARY.md || true

echo "✅ Files staged"
echo ""

# Show git status
echo "📊 Git Status:"
echo "---"
git status --short
echo "---"
echo ""

# Commit message
COMMIT_MESSAGE="feat: implement Stripe payment integration and CI/CD pipelines

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
- Auto-rollback on failure"

echo "💬 Commit Message:"
echo "---"
echo "$COMMIT_MESSAGE"
echo "---"
echo ""

# Ask for confirmation to commit
read -p "Proceed with commit? (yes/no): " CONFIRM_COMMIT

if [ "$CONFIRM_COMMIT" != "yes" ]; then
    echo "❌ Commit cancelled"
    echo "Files remain staged. You can commit manually with:"
    echo "  git commit -m 'Your message here'"
    exit 0
fi

# Create commit
echo ""
echo "🔄 Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo ""
echo "✅ Commit successful!"
echo ""

# Show commit info
echo "📋 Commit Details:"
git log -1 --pretty=format:"%H%n%an <%ae>%n%ad%n%s%n%b" --date=iso

echo ""
echo "🎉 Ready to push!"
echo ""
echo "Next steps:"
echo "1. Review the commit: git show"
echo "2. Push to remote:   git push origin $CURRENT_BRANCH"
echo "3. Create PR on GitHub"
echo ""
echo "Or push directly with:"
echo "  git push origin $CURRENT_BRANCH"
