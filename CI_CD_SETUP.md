# CI/CD Pipeline Setup Guide

This guide explains the CI/CD pipelines configured for the CareLink Platform using GitHub Actions.

## Overview

Three main workflows have been configured:

1. **Backend CI/CD** (`.github/workflows/backend.yml`)
2. **Frontend CI/CD** (`.github/workflows/frontend.yml`)
3. **Kubernetes Deployment** (`.github/workflows/deploy.yml`)

## Workflow Triggers

### Backend CI/CD

Runs automatically when:

- Code is pushed to `main` or `develop` branches with changes in `backend/`
- Pull requests target `main` or `develop` with changes in `backend/`

### Frontend CI/CD

Runs automatically when:

- Code is pushed to `main` or `develop` branches with changes in `frontend/`
- Pull requests target `main` or `develop` with changes in `frontend/`

### Kubernetes Deployment

Runs when:

- Code is pushed to `main` branch with changes in `kubernetes/`
- Manually triggered via GitHub Actions UI with environment selection

## Backend Pipeline Jobs

### 1. Build and Test

**Steps**:

1. Checkout code
2. Setup .NET 8.0
3. Restore NuGet dependencies
4. Build solution in Release configuration
5. Run unit and integration tests
6. Collect code coverage
7. Upload test results and coverage artifacts

**Artifacts**:

- `test-results.trx` - Test execution results
- `coverage.cobertura.xml` - Code coverage reports

### 2. Security Scanning

**Steps**:

1. Checkout code
2. Run Trivy vulnerability scanner
3. Upload SARIF results to GitHub Security

**Coverage**:

- Infrastructure-as-Code scanning
- Dependency vulnerability detection
- Configuration validation

### 3. Docker Image Build

**Steps**:
For each service (10 parallel builds):

- Setup Docker Buildx
- Build Docker image from Dockerfile
- Tag with service name and latest

**Services**:

- ApiGateway
- AuthService
- PaymentService
- AppointmentService
- DoctorService
- PatientService
- NotificationService
- TelemedicineService
- SymptomCheckService
- ChatbotService

### 4. Code Quality & Linting

**Steps**:

1. Checkout code
2. Setup .NET
3. Run dotnet format verification

## Frontend Pipeline Jobs

### 1. Build and Test

**Steps**:

1. Checkout code
2. Setup Node.js 18.x
3. Install npm dependencies (cached)
4. Run ESLint for code quality
5. Build production bundle
6. Run test suite
7. Upload dist/ artifacts

**Artifacts**:

- `frontend/dist/` - Production build (5 day retention)

### 2. Security Scanning

**Steps**:

1. Checkout code
2. Run npm audit for dependency vulnerabilities
3. Run Trivy filesystem scanner
4. Upload SARIF results

**Coverage**:

- Node.js Package vulnerabilities
- Frontend code security issues

### 3. Lighthouse Performance Audit

**Steps**:

1. Checkout code
2. Build application
3. Run Lighthouse CI
4. Upload performance metrics

**Metrics Tracked**:

- Performance score
- Accessibility score
- Best Practices score
- SEO score
- Page load time

### 4. Code Quality Checks

**Steps**:

1. Checkout code
2. Install dependencies
3. Run Prettier formatting check

## Deployment Pipeline Jobs

### 1. Deploy to Kubernetes

**Prerequisites**:

- `secrets.KUBECONFIG` - Base64 encoded kubeconfig

**Steps**:

1. Checkout code
2. Setup Kubectl
3. Configure kubectl with kubeconfig
4. Create namespace, secrets, and configmaps
5. Apply all deployment manifests
6. Apply service manifests
7. Apply ingress configuration
8. Wait for deployment rollout
9. Verify all resources

**Deployed Resources**:

- 10 microservice deployments
- Service manifests
- Ingress controller
- ConfigMaps and Secrets

### 2. Smoke Tests

**Steps**:

1. Run health checks on all services
2. Verify endpoints return 200 OK
3. Report results

### 3. Rollback on Failure

**Triggers**: Automatically if deploy or smoke tests fail

**Actions**:

1. Perform `kubectl rollout undo` for each deployment
2. Restore previous working version
3. Report rollback status

## Setting Up Secrets

Add the following secrets to your GitHub repository:

### For Kubernetes Deployment

```
KUBECONFIG: <base64-encoded-kubeconfig>
```

To generate:

```bash
cat ~/.kube/config | base64 | pbcopy  # macOS
cat ~/.kube/config | base64 -w 0      # Linux
```

### For Stripe Integration (Backend)

Add to repository or secret management:

```
STRIPE_SECRET_KEY: sk_test_xxxxx  # or sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY: pk_test_xxxxx
```

### For Docker Registry (Optional)

```
REGISTRY_USERNAME: <your-username>
REGISTRY_PASSWORD: <your-password>
```

## Monitoring and Notifications

### View Workflow Status

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow to view status

### Job Notifications

Configure notifications in repository settings:

- **Email**: GitHub default notifications
- **Slack**: Add GitHub + Slack integration
- **Custom**: Use GitHub Actions output in webhook

### Viewing Artifacts

1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download test results, coverage reports, or builds

## Performance Optimization

### Caching

**npm Dependencies**:

```yaml
cache: "npm"
cache-dependency-path: "frontend/package-lock.json"
```

**NuGet Packages**:

```bash
dotnet restore --use-lock-file
```

### Parallel Jobs

- 10 Docker service builds run in parallel
- All linting/security scans run in parallel
- Reduces total pipeline time

## Customization

### Adding New Services to Docker Build

1. Add service name to `strategy.matrix.service`
2. Follows existing naming convention

### Changing Node/Dotnet Versions

Update `env` sections:

```yaml
env:
  DOTNET_VERSION: "8.0.x"
  NODE_VERSION: "18.x"
```

### Modifying Build Paths

Update trigger conditions:

```yaml
paths:
  - "backend/**"
  - ".github/workflows/backend.yml"
```

## Troubleshooting

### Build Failures

1. Check logs in GitHub Actions
2. Review error messages
3. Common issues:
   - Missing `.env` file
   - Dependency versions mismatch
   - Configuration issues

### Deployment Failures

1. Verify kubeconfig is valid
2. Check GitHub Secrets are set
3. Ensure Kubernetes cluster is accessible
4. Check pod logs: `kubectl logs -n carelink-platform <pod-name>`

### Security Scan Warnings

Review Trivy findings:

1. Check SARIF upload in Security tab
2. Address high-severity vulnerabilities
3. Update dependencies: `npm audit fix` or `dotnet outdated`

## Cost Optimization

GitHub Actions provides free minutes:

- Public repositories: Unlimited
- Private repositories: 2000 minutes/month

To reduce usage:

1. Run on primary branches only
2. Skip expensive jobs on PRs
3. Use branch protection rules
4. Cache dependencies aggressively

## Next Steps

1. Enable branch protection rules
2. Require status checks to pass
3. Setup automatic deployments
4. Configure environment-specific secrets
5. Add custom health checks
6. Implement automatic rollback triggers
