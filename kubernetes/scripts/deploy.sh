#!/bin/bash

# Apply namespace
kubectl apply -f ../base/namespace.yaml

# Apply configs and secrets
kubectl apply -f ../base/configmap.yaml
kubectl apply -f ../base/secrets.yaml

# Deploy databases
kubectl apply -f ../services/database-services.yaml

# Deploy all services
kubectl apply -f ../deployments/

# Deploy ingress
kubectl apply -f ../ingress/ingress.yaml

# Check status
kubectl get pods -n carelink
kubectl get services -n carelink

echo "✅ CareLink Platform deployed to Kubernetes!"