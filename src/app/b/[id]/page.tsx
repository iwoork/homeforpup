'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Avatar, 
  Button, 
  Tabs, 
  Image, 
  Tag, 
  Space, 
  Rate,
  Input,
  message
} from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined
} from '@ant-design/icons';
import AnnouncementsFeed from '@/components/AnnouncementsFeed';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Mock data for a breeder
const initialBreederData = {
  id: 1,
  name: "Sarah Johnson",
  businessName: "Happy Tails Breeding",
  location: "Seattle, WA",
  phone: "(206) 555-0123",
  email: "sarah@happytails.com",
  experience: "15 years",
  specialties: ["Cavapoo", "Goldendoodle", "Bernedoodle"],
  rating: 4.9,
  reviewCount: 127,
  verified: true,
  profileImage: "https://images.unsplash.com/photo-1494790108755-2616c4e4a6b0?w=400",
  coverImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=400",
  about: "Welcome to Happy Tails! I've been breeding healthy, well-socialized puppies for over 15 years. My focus is on producing puppies with excellent temperaments that make wonderful family companions. All my breeding dogs undergo comprehensive health testing, and every puppy comes with a health guarantee.",
  certifications: ["AKC Breeder of Merit", "GANA Member", "Health Tested Lines"],
  totalLitters: 45,
  totalPuppies: 312,
  currentFamilies: 298
};

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isOwner: boolean;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  editing,
  onEdit,
  onSave,
  onCancel,
  isOwner,
  multiline = false,
  placeholder = "Click to edit"
}) => {
  if (!isOwner) {
    return multiline ? <Paragraph>{value}</Paragraph> : <Text>{value}</Text>;
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {multiline ? (
          <TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ flex: 1 }}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ flex: 1 }}
          />
        )}
        <Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            size="small"
            onClick={onSave}
          >
            Save
          </Button>
          <Button 
            icon={<CloseOutlined />} 
            size="small"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        border: '1px solid transparent'
      }}
      className="editable-field"
      onClick={onEdit}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid #d9d9d9';
        e.currentTarget.style.backgroundColor = '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid transparent';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {multiline ? <Paragraph style={{ margin: 0 }}>{value}</Paragraph> : <Text>{value}</Text>}
      <EditOutlined style={{ color: '#999', fontSize: '12px' }} />
    </div>
  );
};

interface EditableTagsProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  isOwner: boolean;
  title: string;
}

const EditableTags: React.FC<EditableTagsProps> = ({ tags, onUpdate, isOwner, title }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [tempTags, setTempTags] = useState(tags);

  const handleSave = () => {
    onUpdate(tempTags);
    setEditing(false);
    message.success(`${title} updated successfully!`);
  };

  const handleCancel = () => {
    setTempTags(tags);
    setInputValue('');
    setEditing(false);
  };

  const handleAddTag = () => {
    if (inputValue && !tempTags.includes(inputValue)) {
      setTempTags([...tempTags, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove));
  };

  if (!isOwner) {
    return (
      <Space wrap>
        {tags.map(tag => (
          <Tag key={tag} color="blue" style={{ marginBottom: '4px' }}>
            {tag}
          </Tag>
        ))}
      </Space>
    );
  }

  if (editing) {
    return (
      <div>
        <Space wrap style={{ marginBottom: '8px' }}>
          {tempTags.map(tag => (
            <Tag
              key={tag}
              closable
              color="blue"
              onClose={() => handleRemoveTag(tag)}
              style={{ marginBottom: '4px' }}
            >
              {tag}
            </Tag>
          ))}
        </Space>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Input
            placeholder="Add new breed"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleAddTag}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAddTag}>Add</Button>
        </div>
        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save
          </Button>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
        </Space>
      </div>
    );
  }

  return (
    <div
      style={{
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        border: '1px solid transparent'
      }}
      className="editable-tags"
      onClick={() => setEditing(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid #d9d9d9';
        e.currentTarget.style.backgroundColor = '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid transparent';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Space wrap style={{ width: '100%' }}>
        {tags.map(tag => (
          <Tag key={tag} color="blue" style={{ marginBottom: '4px' }}>
            {tag}
          </Tag>
        ))}
        <EditOutlined style={{ color: '#999', fontSize: '12px', alignSelf: 'center' }} />
      </Space>
    </div>
  );
};

const BreederCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [breederData, setBreederData] = useState(initialBreederData);
  const [isOwner, setIsOwner] = useState(true); // In real app, this would be determined by authentication
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const [tempValues, setTempValues] = useState<Record<string, string>>({});

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
  };

  const startEditing = (field: string) => {
    setEditingStates({ ...editingStates, [field]: true });
    setTempValues({ ...tempValues, [field]: breederData[field as keyof typeof breederData] as string });
  };

  const saveField = (field: string) => {
    setBreederData({ ...breederData, [field]: tempValues[field] });
    setEditingStates({ ...editingStates, [field]: false });
    message.success('Information updated successfully!');
  };

  const cancelEdit = (field: string) => {
    setEditingStates({ ...editingStates, [field]: false });
    setTempValues({ ...tempValues, [field]: breederData[field as keyof typeof breederData] as string });
  };

  const updateTempValue = (field: string, value: string) => {
    setTempValues({ ...tempValues, [field]: value });
  };

  const updateSpecialties = (newSpecialties: string[]) => {
    setBreederData({ ...breederData, specialties: newSpecialties });
  };

  const updateCertifications = (newCertifications: string[]) => {
    setBreederData({ ...breederData, certifications: newCertifications });
  };

  const handleImageUpload = (type: 'profile' | 'cover') => {
    // In a real app, this would handle actual file upload
    message.info(`${type} image upload would be handled here`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Toggle Owner Mode Button (for demo purposes) */}
      {isOwner && (
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button
            type="dashed"
            onClick={() => setIsOwner(!isOwner)}
            style={{ marginRight: '8px' }}
          >
            Toggle Edit Mode (Demo)
          </Button>
          <Text type="secondary">
            {isOwner ? 'Editing Enabled' : 'View Only Mode'}
          </Text>
        </div>
      )}

      {/* Cover Photo & Profile Header */}
      <Card 
        style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div 
          style={{
            height: '300px',
            backgroundImage: `url(${breederData.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {isOwner && (
            <Button
              icon={<CameraOutlined />}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none'
              }}
              onClick={() => handleImageUpload('cover')}
            >
              Change Cover
            </Button>
          )}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            right: '24px'
          }}>
            <Row align="bottom" justify="space-between">
              <Col>
                <Space align="end" size={16}>
                  <div style={{ position: 'relative' }}>
                    <Avatar 
                      size={120} 
                      src={breederData.profileImage}
                      style={{ border: '4px solid white' }}
                    />
                    {isOwner && (
                      <Button
                        icon={<CameraOutlined />}
                        size="small"
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleImageUpload('profile')}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EditableText
                        value={breederData.businessName}
                        onChange={(value) => updateTempValue('businessName', value)}
                        editing={editingStates.businessName || false}
                        onEdit={() => startEditing('businessName')}
                        onSave={() => saveField('businessName')}
                        onCancel={() => cancelEdit('businessName')}
                        isOwner={isOwner}
                        placeholder="Business name"
                      />
                      {breederData.verified && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                    </div>
                    <EditableText
                      value={`by ${breederData.name}`}
                      onChange={(value) => updateTempValue('name', value.replace('by ', ''))}
                      editing={editingStates.name || false}
                      onEdit={() => startEditing('name')}
                      onSave={() => saveField('name')}
                      onCancel={() => cancelEdit('name')}
                      isOwner={isOwner}
                      placeholder="Your name"
                    />
                    <br />
                    <Space style={{ marginTop: '4px' }}>
                      <Rate disabled defaultValue={breederData.rating} style={{ fontSize: '14px' }} />
                      <Text style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {breederData.rating} ({breederData.reviewCount} reviews)
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button type="primary" size="large" style={{ background: '#FA8072', borderColor: '#FA8072' }}>
                    Message Breeder
                  </Button>
                  <Button size="large">
                    Follow Updates
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Breeder Info */}
        <Col xs={24} lg={8}>
          {/* About Card */}
          <Card title="About" style={cardStyle}>
            <EditableText
              value={breederData.about}
              onChange={(value) => updateTempValue('about', value)}
              editing={editingStates.about || false}
              onEdit={() => startEditing('about')}
              onSave={() => saveField('about')}
              onCancel={() => cancelEdit('about')}
              isOwner={isOwner}
              multiline={true}
              placeholder="Tell people about your breeding program..."
            />
            
            <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <EditableText
                  value={breederData.location}
                  onChange={(value) => updateTempValue('location', value)}
                  editing={editingStates.location || false}
                  onEdit={() => startEditing('location')}
                  onSave={() => saveField('location')}
                  onCancel={() => cancelEdit('location')}
                  isOwner={isOwner}
                  placeholder="Your location"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <EditableText
                  value={`${breederData.experience} experience`}
                  onChange={(value) => updateTempValue('experience', value.replace(' experience', ''))}
                  editing={editingStates.experience || false}
                  onEdit={() => startEditing('experience')}
                  onSave={() => saveField('experience')}
                  onCancel={() => cancelEdit('experience')}
                  isOwner={isOwner}
                  placeholder="Years of experience"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <EditableText
                  value={breederData.phone}
                  onChange={(value) => updateTempValue('phone', value)}
                  editing={editingStates.phone || false}
                  onEdit={() => startEditing('phone')}
                  onSave={() => saveField('phone')}
                  onCancel={() => cancelEdit('phone')}
                  isOwner={isOwner}
                  placeholder="Phone number"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <EditableText
                  value={breederData.email}
                  onChange={(value) => updateTempValue('email', value)}
                  editing={editingStates.email || false}
                  onEdit={() => startEditing('email')}
                  onSave={() => saveField('email')}
                  onCancel={() => cancelEdit('email')}
                  isOwner={isOwner}
                  placeholder="Email address"
                />
              </div>
            </Space>
          </Card>

          {/* Specialties */}
          <Card title="Breeds We Specialize In" style={cardStyle}>
            <EditableTags
              tags={breederData.specialties}
              onUpdate={updateSpecialties}
              isOwner={isOwner}
              title="Specialties"
            />
          </Card>

          {/* Certifications */}
          <Card title="Certifications & Memberships" style={cardStyle}>
            <EditableTags
              tags={breederData.certifications}
              onUpdate={updateCertifications}
              isOwner={isOwner}
              title="Certifications"
            />
          </Card>

          {/* Stats */}
          <Card title="Breeding Statistics" style={cardStyle}>
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breederData.totalLitters}
                </Title>
                <Text type="secondary">Total Litters</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#FA8072' }}>
                  {breederData.totalPuppies}
                </Title>
                <Text type="secondary">Puppies Placed</Text>
              </Col>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breederData.currentFamilies}
                </Title>
                <Text type="secondary">Happy Families</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
          >
            <TabPane tab="Community Posts" key="posts">
              <AnnouncementsFeed />
            </TabPane>
            
            <TabPane tab="Available Puppies" key="available">
              <Card style={cardStyle}>
                <Title level={4}>Current Available Puppies</Title>
                <Paragraph>Check back soon for available puppies from our upcoming litters!</Paragraph>
                <Button type="primary" style={{ background: '#08979C', borderColor: '#08979C' }}>
                  Join Waiting List
                </Button>
              </Card>
            </TabPane>
            
            <TabPane tab="Our Dogs" key="dogs">
              <Card style={cardStyle}>
                <Title level={4}>Meet Our Breeding Dogs</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card cover={<Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300" alt="Bella - F1 Cavapoo" />}>
                      <Title level={5}>Bella</Title>
                      <Text>F1 Cavapoo • Health Tested • Champion Bloodline</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card cover={<Image src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300" alt="Max - Poodle Stud" />}>
                      <Title level={5}>Max</Title>
                      <Text>Poodle Stud • OFA Certified • Proven Producer</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </TabPane>
            
            <TabPane tab="Reviews" key="reviews">
              <Card style={cardStyle}>
                <Title level={4}>Family Reviews</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
                      <Space align="start">
                        <Avatar src={`https://images.unsplash.com/photo-150700321116${i}-0a1dd7228f2d?w=100`} />
                        <div style={{ flex: 1 }}>
                          <div>
                            <Text strong>The Martinez Family</Text>
                            <Rate disabled defaultValue={5} style={{ marginLeft: '8px', fontSize: '12px' }} />
                          </div>
                          <Text type="secondary">2 weeks ago</Text>
                          <Paragraph style={{ marginTop: '8px' }}>
                            &ldquo;Sarah was amazing throughout the entire process. Our goldendoodle Charlie is healthy, well-socialized, and has the most wonderful temperament. Highly recommend Happy Tails!&rdquo;
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default BreederCommunityPage;