'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Steps, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Form, 
  Select, 
  Input, 
  Checkbox, 
  Radio, 
  Slider, 
  Space, 
  Alert, 
  Progress,
  Divider,
  Tag,
  Tooltip,
  Badge
} from 'antd';
import { 
  HeartOutlined, 
  HomeOutlined, 
  TeamOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { BreedSelector } from '@/components';
import CountryFilter from '@/components/filters/CountryFilter';
import StateFilter from '@/components/filters/StateFilter';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface SearchCriteria {
  // Basic preferences
  breeds: string[];
  gender: string | null;
  ageRange: [number, number];
  size: string[];
  
  // Lifestyle factors
  activityLevel: string;
  livingSpace: string;
  familySize: string;
  childrenAges: string[];
  experienceLevel: string;
  
  // Location preferences
  country: string;
  state: string[];
  maxDistance: number;
  shipping: boolean;
  
  // Breeder preferences
  verifiedOnly: boolean;
  minRating: number;
  minExperience: number;
  
  // Budget
  budgetRange: [number, number];
  
  // Timeline
  timeline: string;
}

interface WizardStep {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const PuppySearchWizard: React.FC<{
  onComplete: (criteria: SearchCriteria) => void;
  onCancel: () => void;
  initialCriteria?: Partial<SearchCriteria>;
}> = ({ onComplete, onCancel, initialCriteria }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [criteria, setCriteria] = useState<SearchCriteria>({
    breeds: [],
    gender: null,
    ageRange: [8, 16],
    size: [],
    activityLevel: '',
    livingSpace: '',
    familySize: '',
    childrenAges: [],
    experienceLevel: '',
    country: 'Canada',
    state: [],
    maxDistance: 100,
    shipping: false,
    verifiedOnly: false,
    minRating: 0,
    minExperience: 0,
    budgetRange: [1000, 5000],
    timeline: '',
    ...initialCriteria
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Update form when criteria change
  useEffect(() => {
    form.setFieldsValue(criteria);
  }, [criteria, form]);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setCriteria({ ...criteria, ...values });
      
      if (currentStep < steps.length - 1) {
        handleStepComplete(currentStep);
        setCurrentStep(currentStep + 1);
      } else {
        handleStepComplete(currentStep);
        onComplete({ ...criteria, ...values });
      }
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps: WizardStep[] = [
    {
      key: 'breed-preference',
      title: 'Breed & Basic Info',
      description: 'Tell us about your ideal puppy',
      icon: <HeartOutlined />,
      content: (
        <div>
          <Title level={4}>What type of puppy are you looking for?</Title>
          <Paragraph>
            This helps us match you with the right breeders and puppies. Don't worry - you can always adjust these preferences later.
          </Paragraph>
          
          <Form.Item
            name="breeds"
            label="Preferred Breeds"
            rules={[{ required: true, message: 'Please select at least one breed' }]}
            tooltip="Select breeds that match your lifestyle and preferences"
          >
            <BreedSelector
              multiple
              placeholder="Select breeds you're interested in"
              style={{ width: '100%' }}
              showSearch
              showBreedInfo={true}
              showBreederCount={false}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Gender Preference"
                tooltip="Do you have a preference for male or female?"
              >
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="any">No Preference</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ageRange"
                label="Preferred Age Range (weeks)"
                tooltip="Most puppies go to new homes between 8-16 weeks"
              >
                <Slider
                  range
                  min={6}
                  max={20}
                  marks={{
                    6: '6 weeks',
                    8: '8 weeks',
                    12: '12 weeks',
                    16: '16 weeks',
                    20: '20 weeks'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="size"
            label="Size Preference"
            tooltip="Consider your living space and lifestyle"
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="toy">Toy (under 10 lbs)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="small">Small (10-25 lbs)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="medium">Medium (25-50 lbs)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="large">Large (50-80 lbs)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="giant">Giant (80+ lbs)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="any">No Preference</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </div>
      )
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle & Family',
      description: 'Help us understand your home environment',
      icon: <HomeOutlined />,
      content: (
        <div>
          <Title level={4}>Tell us about your lifestyle and family</Title>
          <Paragraph>
            This information helps us ensure the puppy will be a great fit for your home and family.
          </Paragraph>

          <Form.Item
            name="activityLevel"
            label="Your Activity Level"
            rules={[{ required: true, message: 'Please select your activity level' }]}
            tooltip="How active are you? This affects which breeds would be suitable"
          >
            <Radio.Group>
              <Radio value="low">Low - I prefer calm, relaxed activities</Radio>
              <Radio value="moderate">Moderate - I enjoy regular walks and play</Radio>
              <Radio value="high">High - I love hiking, running, and active adventures</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="livingSpace"
            label="Living Space"
            rules={[{ required: true, message: 'Please select your living space' }]}
            tooltip="The size of your home affects which breeds would be comfortable"
          >
            <Radio.Group>
              <Radio value="apartment">Apartment or Condo</Radio>
              <Radio value="house-small">Small House (under 1500 sq ft)</Radio>
              <Radio value="house-medium">Medium House (1500-2500 sq ft)</Radio>
              <Radio value="house-large">Large House (over 2500 sq ft)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="familySize"
            label="Family Size"
            rules={[{ required: true, message: 'Please select your family size' }]}
          >
            <Radio.Group>
              <Radio value="single">Just me</Radio>
              <Radio value="couple">Couple</Radio>
              <Radio value="small-family">Small family (3-4 people)</Radio>
              <Radio value="large-family">Large family (5+ people)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="childrenAges"
            label="Children in Household"
            tooltip="Select all that apply"
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="infants">Infants (0-2 years)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="toddlers">Toddlers (2-5 years)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="school-age">School age (6-12 years)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="teens">Teens (13-17 years)</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="adults-only">Adults only</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="experienceLevel"
            label="Dog Ownership Experience"
            rules={[{ required: true, message: 'Please select your experience level' }]}
            tooltip="This helps us recommend appropriate breeds and breeders"
          >
            <Radio.Group>
              <Radio value="first-time">First-time dog owner</Radio>
              <Radio value="some-experience">Some experience with dogs</Radio>
              <Radio value="experienced">Experienced dog owner</Radio>
              <Radio value="very-experienced">Very experienced (breeder, trainer, etc.)</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      )
    },
    {
      key: 'location',
      title: 'Location & Travel',
      description: 'Where are you looking for a puppy?',
      icon: <TeamOutlined />,
      content: (
        <div>
          <Title level={4}>Location and travel preferences</Title>
          <Paragraph>
            Help us find breeders in your area or determine if shipping is needed.
          </Paragraph>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select your country' }]}
          >
            <CountryFilter
              style={{ width: '100%' }}
              placeholder="Select country"
            />
          </Form.Item>

          <Form.Item
            name="state"
            label="State/Province"
            tooltip="Select states or provinces you're willing to travel to"
          >
            <StateFilter
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select states/provinces"
            />
          </Form.Item>

          <Form.Item
            name="maxDistance"
            label="Maximum Travel Distance (miles)"
            tooltip="How far are you willing to travel to pick up your puppy?"
          >
            <Slider
              min={0}
              max={500}
              marks={{
                0: '0 miles',
                50: '50 miles',
                100: '100 miles',
                250: '250 miles',
                500: '500+ miles'
              }}
            />
          </Form.Item>

          <Form.Item
            name="shipping"
            label="Shipping Options"
            tooltip="Are you open to having a puppy shipped to you?"
            valuePropName="checked"
          >
            <Checkbox>
              I'm open to shipping options (additional cost may apply)
            </Checkbox>
          </Form.Item>

          <Alert
            message="Travel Considerations"
            description="Many ethical breeders prefer to meet families in person. Consider the benefits of visiting the breeder's home to see the puppy's environment and meet the parent dogs."
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        </div>
      )
    },
    {
      key: 'breeder-preferences',
      title: 'Breeder Standards',
      description: 'What matters most in a breeder?',
      icon: <SafetyOutlined />,
      content: (
        <div>
          <Title level={4}>Breeder quality and standards</Title>
          <Paragraph>
            These preferences help us connect you with ethical, responsible breeders who prioritize the health and wellbeing of their dogs.
          </Paragraph>

          <Form.Item
            name="verifiedOnly"
            label="Breeder Verification"
            valuePropName="checked"
            tooltip="Only show breeders who have been verified by our team"
          >
            <Checkbox>
              Show only verified breeders (recommended)
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="minRating"
            label="Minimum Breeder Rating"
            tooltip="Higher ratings indicate better breeder reputation and customer satisfaction"
          >
            <Slider
              min={0}
              max={5}
              step={0.5}
              marks={{
                0: 'Any rating',
                2: '2+ stars',
                3: '3+ stars',
                4: '4+ stars',
                5: '5 stars only'
              }}
            />
          </Form.Item>

          <Form.Item
            name="minExperience"
            label="Minimum Breeding Experience (years)"
            tooltip="More experienced breeders often have better knowledge and practices"
          >
            <Slider
              min={0}
              max={20}
              marks={{
                0: 'Any experience',
                2: '2+ years',
                5: '5+ years',
                10: '10+ years',
                20: '20+ years'
              }}
            />
          </Form.Item>

          <Alert
            message="What to Look for in Ethical Breeders"
            type="info"
            showIcon
            description={
              <div>
                <p><strong>Health Testing:</strong> Parents should have health clearances for breed-specific conditions</p>
                <p><strong>Socialization:</strong> Puppies should be raised in a home environment with proper socialization</p>
                <p><strong>Transparency:</strong> Breeders should be open about their practices and allow home visits</p>
                <p><strong>Support:</strong> Good breeders provide ongoing support and take back puppies if needed</p>
              </div>
            }
            style={{ marginTop: '16px' }}
          />
        </div>
      )
    },
    {
      key: 'budget-timeline',
      title: 'Budget & Timeline',
      description: 'Plan your puppy investment',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <Title level={4}>Budget and timeline considerations</Title>
          <Paragraph>
            Understanding costs and timing helps set realistic expectations for your puppy search.
          </Paragraph>

          <Form.Item
            name="budgetRange"
            label="Budget Range (USD)"
            rules={[{ required: true, message: 'Please set your budget range' }]}
            tooltip="Puppy prices vary by breed, location, and breeder reputation"
          >
            <Slider
              range
              min={500}
              max={10000}
              step={250}
              marks={{
                500: '$500',
                2000: '$2,000',
                4000: '$4,000',
                6000: '$6,000',
                10000: '$10,000+'
              }}
            />
          </Form.Item>

          <Alert
            message="Budget Considerations"
            type="warning"
            showIcon
            description={
              <div>
                <p><strong>Initial Cost:</strong> Puppy price, supplies, vet checkup</p>
                <p><strong>Ongoing Costs:</strong> Food, veterinary care, grooming, training</p>
                <p><strong>Emergency Fund:</strong> Set aside money for unexpected health issues</p>
                <p><strong>Quality vs Price:</strong> Higher prices often reflect better health testing and care</p>
              </div>
            }
            style={{ marginBottom: '24px' }}
          />

          <Form.Item
            name="timeline"
            label="When do you want to bring home a puppy?"
            rules={[{ required: true, message: 'Please select your timeline' }]}
            tooltip="This helps us prioritize breeders with available puppies or upcoming litters"
          >
            <Radio.Group>
              <Radio value="asap">As soon as possible</Radio>
              <Radio value="1-3-months">Within 1-3 months</Radio>
              <Radio value="3-6-months">Within 3-6 months</Radio>
              <Radio value="6-12-months">Within 6-12 months</Radio>
              <Radio value="flexible">I'm flexible on timing</Radio>
            </Radio.Group>
          </Form.Item>

          <Alert
            message="Timeline Reality Check"
            type="info"
            showIcon
            description="Quality breeders often have waiting lists. The best breeders may have 6-12 month wait times, but this ensures you get a well-socialized, healthy puppy from a responsible breeder."
            style={{ marginTop: '16px' }}
          />
        </div>
      )
    }
  ];

  const progressPercentage = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#08979C', marginBottom: '8px' }}>
            Find Your Perfect Puppy
          </Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            Let's create a personalized search to help you find the right puppy and breeder
          </Paragraph>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text strong>Step {currentStep + 1} of {steps.length}</Text>
            <Text>{progressPercentage}% Complete</Text>
          </div>
          <Progress percent={progressPercentage} strokeColor="#08979C" />
        </div>

        {/* Steps */}
        <Steps
          current={currentStep}
          items={steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: completedSteps.includes(index) ? 
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
              step.icon
          }))}
          style={{ marginBottom: '32px' }}
        />

        {/* Current Step Content */}
        <Card style={{ marginBottom: '24px' }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={criteria}
            onValuesChange={(changedValues) => {
              setCriteria({ ...criteria, ...changedValues });
            }}
          >
            {steps[currentStep].content}
          </Form>
        </Card>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            icon={<ArrowLeftOutlined />}
          >
            Previous
          </Button>

          <Space>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleNext}
              icon={currentStep === steps.length - 1 ? <SearchOutlined /> : <ArrowRightOutlined />}
            >
              {currentStep === steps.length - 1 ? 'Start Search' : 'Next'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default PuppySearchWizard;
