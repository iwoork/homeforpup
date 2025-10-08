#!/bin/bash
# Helper script to set up custom domain for API Gateway
# Usage: ./scripts/setup-custom-domain.sh <domain-name>

set -e

DOMAIN="${1:-api.homeforpup.com}"
REGION="us-east-1"

echo "🌐 Setting up custom domain: $DOMAIN"
echo ""

# Step 1: Check for existing certificate
echo "Step 1: Checking for existing certificates..."
EXISTING_CERT=$(aws acm list-certificates --region $REGION \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN' || DomainName=='*.' + split('$DOMAIN', '.')[1:] | join('.', @)].CertificateArn | [0]" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_CERT" ] && [ "$EXISTING_CERT" != "None" ]; then
  echo "✅ Found existing certificate: $EXISTING_CERT"
  CERT_ARN=$EXISTING_CERT
  
  # Check status
  STATUS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region $REGION \
    --query 'Certificate.Status' --output text)
  
  if [ "$STATUS" != "ISSUED" ]; then
    echo "⚠️  Certificate status: $STATUS"
    echo "   Certificate must be ISSUED before proceeding"
    exit 1
  fi
else
  echo "📝 No existing certificate found"
  echo ""
  read -p "Do you want to create a new certificate? (y/n) " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Request certificate
    echo "Requesting certificate for $DOMAIN..."
    CERT_ARN=$(aws acm request-certificate \
      --domain-name $DOMAIN \
      --validation-method DNS \
      --region $REGION \
      --query 'CertificateArn' \
      --output text)
    
    echo "✅ Certificate requested: $CERT_ARN"
    echo ""
    echo "⏳ Next steps:"
    echo "   1. Go to ACM console: https://console.aws.amazon.com/acm/home?region=us-east-1"
    echo "   2. Click on the certificate"
    echo "   3. Create DNS validation record (button available)"
    echo "   4. Wait for status to become ISSUED (~5-30 minutes)"
    echo "   5. Run this script again"
    echo ""
    exit 0
  else
    echo "❌ Certificate required. Exiting."
    exit 1
  fi
fi

# Step 2: Update .env file
echo ""
echo "Step 2: Updating .env configuration..."

if grep -q "ACM_CERTIFICATE_ARN=" .env 2>/dev/null; then
  # Update existing
  sed -i.bak "s|ACM_CERTIFICATE_ARN=.*|ACM_CERTIFICATE_ARN=$CERT_ARN|" .env
  sed -i.bak "s|API_DOMAIN_NAME=.*|API_DOMAIN_NAME=$DOMAIN|" .env
  rm .env.bak 2>/dev/null || true
else
  # Append
  echo "API_DOMAIN_NAME=$DOMAIN" >> .env
  echo "ACM_CERTIFICATE_ARN=$CERT_ARN" >> .env
fi

echo "✅ Updated .env file"

# Step 3: Deploy
echo ""
echo "Step 3: Deploying with custom domain..."
echo ""
read -p "Deploy now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run deploy -- --require-approval never
  
  # Get the domain target
  TARGET=$(aws cloudformation describe-stacks \
    --stack-name homeforpup-api-development \
    --query 'Stacks[0].Outputs[?OutputKey==`CustomDomainTarget`].OutputValue' \
    --output text 2>/dev/null || echo "")
  
  if [ -n "$TARGET" ]; then
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "Step 4: Configure DNS"
    echo "   Add this record to your DNS:"
    echo ""
    echo "   Name: api"
    echo "   Type: CNAME"
    echo "   Value: $TARGET"
    echo "   TTL: 300"
    echo ""
    echo "   Or if using Route53 A record:"
    echo "   Name: api.homeforpup.com"
    echo "   Type: A (Alias)"
    echo "   Target: $TARGET"
    echo ""
    echo "Step 5: Wait for DNS propagation (5-30 minutes)"
    echo "   Check with: dig api.homeforpup.com"
    echo ""
    echo "Step 6: Test your custom domain"
    echo "   curl \"https://$DOMAIN/development/breeds?limit=3\""
    echo ""
  fi
else
  echo "Skipped deployment. Run 'npm run deploy' manually when ready."
fi

echo ""
echo "🎉 Setup complete!"

