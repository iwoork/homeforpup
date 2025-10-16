#!/bin/bash

# Apple App Store Deployment Script
# This script helps prepare your React Native app for App Store deployment

set -e  # Exit on any error

echo "🚀 Starting Apple App Store Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the mobile-app directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Xcode is installed (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed. Please install Xcode from the Mac App Store."
        exit 1
    fi
else
    print_error "This script must be run on macOS for iOS deployment."
    exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    print_error "CocoaPods is not installed. Please install CocoaPods first:"
    print_error "sudo gem install cocoapods"
    exit 1
fi

print_success "All prerequisites are installed!"

# Clean and install dependencies
print_status "Cleaning and installing dependencies..."

# Clean node_modules
if [ -d "node_modules" ]; then
    print_status "Removing node_modules..."
    rm -rf node_modules
fi

# Install npm dependencies
print_status "Installing npm dependencies..."
npm install

# Clean iOS build
print_status "Cleaning iOS build..."
cd ios

# Clean Pods
if [ -d "Pods" ]; then
    print_status "Removing Pods..."
    rm -rf Pods
fi

if [ -f "Podfile.lock" ]; then
    print_status "Removing Podfile.lock..."
    rm Podfile.lock
fi

# Install CocoaPods dependencies
print_status "Installing CocoaPods dependencies..."
pod install

cd ..

print_success "Dependencies installed successfully!"

# Check if Xcode project exists
if [ ! -f "ios/BreederIosApp.xcworkspace/contents.xcworkspacedata" ]; then
    print_error "Xcode workspace not found. Please ensure your iOS project is properly configured."
    exit 1
fi

print_status "Opening Xcode project..."

# Open Xcode project
open ios/BreederIosApp.xcworkspace

print_success "Xcode project opened!"

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. In Xcode, select 'Any iOS Device (arm64)' as the target"
echo "2. Set your Bundle Identifier and signing team"
echo "3. Set the version to 1.0.0 and build to 1"
echo "4. Go to Product → Archive"
echo "5. In Organizer, click 'Distribute App'"
echo "6. Choose 'App Store Connect'"
echo "7. Follow the upload wizard"
echo ""
echo "📱 After upload:"
echo "1. Go to App Store Connect"
echo "2. Complete app information"
echo "3. Upload screenshots"
echo "4. Submit for review"
echo ""
echo "📖 For detailed instructions, see:"
echo "   - APPLE_STORE_DEPLOYMENT_GUIDE.md"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo ""
print_success "Happy deploying! 🚀"
