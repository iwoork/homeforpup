// Simple test script for the contact form API
// Run with: node test-contact-form.js

const testContactForm = async () => {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact Form',
    message: 'This is a test message to verify the contact form is working properly.',
    type: 'general'
  };

  try {
    console.log('Testing contact form API...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', result);

    if (response.ok) {
      console.log('✅ Contact form test passed!');
    } else {
      console.log('❌ Contact form test failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testContactForm();
}

module.exports = testContactForm;
