'use client';

import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Button, Tabs, Image, Tag, Space,
  Rate, Spin, Alert, Input, message, Breadcrumb
} from 'antd';
import {
  CalendarOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined,
  GlobalOutlined, ClockCircleOutlined, ShoppingOutlined,
  HomeOutlined, TrophyOutlined, HeartOutlined, TeamOutlined, StarOutlined,
  LoadingOutlined, PictureOutlined, EditOutlined, LockOutlined,
  CommentOutlined, SendOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@homeforpup/shared-auth';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Breeder interface
interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
  userId?: number;
  breederInfo?: {
    website?: string;
  };
}

// SWR fetcher
const fetcher = async (url: string): Promise<{ breeder: Breeder }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeder');
  }
  return response.json();
};

// Puppy type from the /api/puppies endpoint
interface PuppyFromApi {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  ageWeeks: number;
  price: number;
  location: string;
  image: string;
  description?: string;
  healthStatus: string;
}

// Fetcher for puppies API
const puppiesFetcher = async (url: string): Promise<{ puppies: PuppyFromApi[]; total: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch puppies');
  }
  return response.json();
};

const BreederPuppiesTab: React.FC<{ breederId: string; cardStyle: React.CSSProperties }> = ({ breederId, cardStyle }) => {
  const { data: puppiesData, error: puppiesError, isLoading: puppiesLoading } = useSWR(
    breederId ? `/api/puppies?breederId=${breederId}` : null,
    puppiesFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const puppies = puppiesData?.puppies || [];

  if (puppiesLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading puppies..." />
        </div>
      </Card>
    );
  }

  if (puppiesError) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Unable to load puppies"
          description="There was a problem fetching available puppies. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (puppies.length === 0) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={4}>No Puppies Available</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            This breeder doesn&apos;t have any puppies available right now. Check back soon for upcoming litters!
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: '16px' }}>
        Available Puppies ({puppies.length})
      </Title>
      <Row gutter={[16, 16]}>
        {puppies.map((puppy) => (
          <Col xs={24} sm={12} md={12} key={puppy.id}>
            <Link href={`/puppies/${puppy.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Card
                hoverable
                style={{ ...cardStyle, overflow: 'hidden' }}
                cover={
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={puppy.image}
                      alt={puppy.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = '/api/placeholder/400/200'; }}
                    />
                    <Tag color="blue" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {puppy.ageWeeks} weeks
                    </Tag>
                  </div>
                }
              >
                <Title level={5} style={{ margin: 0, color: '#08979C' }}>{puppy.name}</Title>
                <Text type="secondary">{puppy.breed} &bull; {puppy.gender}</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#08979C', fontSize: '12px' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{puppy.location}</Text>
                  </Space>
                </div>
                {puppy.price > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#08979C' }}>
                      ${puppy.price.toLocaleString()}
                    </Text>
                  </div>
                )}
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Gallery photo type
interface GalleryPhoto {
  url: string;
  caption: string;
}

const BreederGalleryTab: React.FC<{ breederId: string; breeder: Breeder; cardStyle: React.CSSProperties }> = ({ breederId, breeder, cardStyle }) => {
  // Fetch puppies to get their images for the gallery
  const { data: puppiesData, isLoading } = useSWR(
    breederId ? `/api/puppies?breederId=${breederId}` : null,
    puppiesFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Build gallery photos from breeder images + puppy images
  const galleryPhotos: GalleryPhoto[] = React.useMemo(() => {
    const photos: GalleryPhoto[] = [];

    // Add breeder cover image
    if (breeder.coverImage) {
      photos.push({ url: breeder.coverImage, caption: `${breeder.businessName}` });
    }

    // Add breeder profile image
    if (breeder.profileImage) {
      photos.push({ url: breeder.profileImage, caption: `${breeder.businessName}` });
    }

    // Add puppy images
    if (puppiesData?.puppies) {
      for (const puppy of puppiesData.puppies) {
        if (puppy.image) {
          photos.push({ url: puppy.image, caption: `${puppy.name} - ${puppy.breed}` });
        }
      }
    }

    return photos;
  }, [breeder.coverImage, breeder.profileImage, breeder.businessName, puppiesData]);

  if (isLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading gallery..." />
        </div>
      </Card>
    );
  }

  if (galleryPhotos.length === 0) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4}>No Photos Yet</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            This breeder hasn&apos;t added any photos to their gallery yet. Check back soon!
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: '16px' }}>
        Photo Gallery ({galleryPhotos.length})
      </Title>
      <Image.PreviewGroup>
        <Row gutter={[16, 16]}>
          {galleryPhotos.map((photo, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <div
                style={{
                  position: 'relative',
                  height: '200px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                  fallback="/api/placeholder/300/200"
                  placeholder={
                    <div style={{
                      width: '100%',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                    }}>
                      <Spin indicator={<LoadingOutlined spin />} />
                    </div>
                  }
                />
              </div>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                {photo.caption}
              </Text>
            </Col>
          ))}
        </Row>
      </Image.PreviewGroup>
    </div>
  );
};

// Review type from the /api/reviews endpoint
interface ReviewFromApi {
  id: string;
  breederId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Fetcher for reviews API
const reviewsFetcher = async (url: string): Promise<{ reviews: ReviewFromApi[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
};

// Post type from the /api/posts endpoint
interface PostFromApi {
  id: string;
  authorId: string;
  authorName: string;
  breederId: string;
  title: string;
  content: string;
  postType: 'litter' | 'health' | 'achievement' | 'event' | 'available' | 'general';
  photos: string[];
  tags: string[];
  createdAt: string;
}

// Fetcher for posts API
const postsFetcher = async (url: string): Promise<{ posts: PostFromApi[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

// Comment type from the /api/posts/[postId]/comments endpoint
interface CommentFromApi {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Fetcher for comments API
const commentsFetcher = async (url: string): Promise<{ comments: CommentFromApi[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
};

// PostComments component - displays comments for a post with expand/collapse
const PostComments: React.FC<{ postId: string }> = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: commentsData, isLoading: commentsLoading, mutate: mutateComments } = useSWR(
    expanded ? `/api/posts/${postId}/comments` : null,
    commentsFetcher,
    { revalidateOnFocus: false }
  );

  // Track comment count separately so we can show it before expanding
  const { data: countData } = useSWR(
    `/api/posts/${postId}/comments?limit=0`,
    commentsFetcher,
    { revalidateOnFocus: false }
  );

  const comments = commentsData?.comments || [];
  const commentCount = commentsData?.count ?? countData?.count ?? 0;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }
      setCommentText('');
      mutateComments();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '12px', paddingTop: '8px' }}>
      <Button
        type="text"
        icon={<CommentOutlined />}
        onClick={() => setExpanded(!expanded)}
        style={{ color: '#08979C', padding: '4px 8px' }}
      >
        {expanded ? 'Hide Comments' : 'Comments'} ({commentCount})
      </Button>

      {expanded && (
        <div style={{ marginTop: '8px' }}>
          {commentsLoading ? (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <Spin size="small" />
            </div>
          ) : comments.length === 0 ? (
            <Text type="secondary" style={{ fontSize: '13px', display: 'block', padding: '8px 0' }}>
              No comments yet. Be the first to comment!
            </Text>
          ) : (
            <div style={{ marginBottom: '8px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '13px' }}>{comment.authorName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </div>
                  <Text style={{ fontSize: '13px', display: 'block', marginTop: '2px' }}>{comment.content}</Text>
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onPressEnter={() => { if (!submitting && commentText.trim()) handleSubmitComment(); }}
                disabled={submitting}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitComment}
                loading={submitting}
                disabled={submitting || !commentText.trim()}
                style={{ background: '#08979C', borderColor: '#08979C' }}
              />
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                <Link href="/auth/signin" style={{ color: '#08979C' }}>Sign in</Link> to comment
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const POST_TYPE_COLORS: Record<string, string> = {
  litter: 'blue',
  health: 'green',
  achievement: 'gold',
  event: 'purple',
  available: 'cyan',
  general: 'default',
};

const BreederPostsTab: React.FC<{ breederId: string; cardStyle: React.CSSProperties }> = ({ breederId, cardStyle }) => {
  const { data: postsData, error: postsError, isLoading: postsLoading } = useSWR(
    breederId ? `/api/posts?breederId=${breederId}` : null,
    postsFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const posts = postsData?.posts || [];

  if (postsLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading posts..." />
        </div>
      </Card>
    );
  }

  if (postsError) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Unable to load posts"
          description="There was a problem fetching community posts. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={4}>No Posts Yet</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            This breeder hasn&apos;t shared any community updates yet. Check back soon!
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <Card key={post.id} style={{ ...cardStyle, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <Text strong style={{ fontSize: '15px' }}>{post.authorName}</Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color={POST_TYPE_COLORS[post.postType] || 'default'}>
                  {post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
                </Tag>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </div>
          {post.title && (
            <Title level={5} style={{ margin: '8px 0 4px 0' }}>{post.title}</Title>
          )}
          <Paragraph style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{post.content}</Paragraph>
          {post.photos && post.photos.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {post.photos.map((photo, idx) => (
                    <Col xs={12} sm={8} key={idx}>
                      <Image
                        src={photo}
                        alt={`${post.title || 'Post'} photo ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                        fallback="/api/placeholder/200/120"
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          )}
          <PostComments postId={post.id} />
        </Card>
      ))}
    </div>
  );
};

const BreederReviewsTab: React.FC<{ breederId: string; breeder: Breeder; cardStyle: React.CSSProperties }> = ({ breederId, breeder, cardStyle }) => {
  const { isAuthenticated } = useAuth();
  const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading, mutate: mutateReviews } = useSWR(
    breederId ? `/api/reviews?breederId=${breederId}` : null,
    reviewsFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (formRating === 0 || !formTitle.trim() || !formContent.trim()) {
      message.warning('Please fill in all fields and select a rating.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breederId,
          rating: formRating,
          title: formTitle.trim(),
          content: formContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      message.success('Review submitted successfully!');
      setShowForm(false);
      setFormRating(0);
      setFormTitle('');
      setFormContent('');
      mutateReviews();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = React.useMemo(() => reviewsData?.reviews || [], [reviewsData?.reviews]);

  // Calculate rating distribution
  const ratingDistribution = React.useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    for (const review of reviews) {
      const idx = Math.max(0, Math.min(4, Math.round(review.rating) - 1));
      dist[idx]++;
    }
    return dist;
  }, [reviews]);

  // Calculate average rating from actual reviews
  const avgRating = React.useMemo(() => {
    if (reviews.length === 0) return breeder.rating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, breeder.rating]);

  const totalReviews = reviews.length || breeder.reviewCount;

  if (reviewsLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading reviews..." />
        </div>
      </Card>
    );
  }

  if (reviewsError) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Unable to load reviews"
          description="There was a problem fetching reviews. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const reviewFormBlock = (
    <>
      {isAuthenticated ? (
        showForm ? (
          <Card style={{ ...cardStyle, border: '1px solid #08979C' }}>
            <Title level={5} style={{ marginBottom: '16px' }}>Write a Review</Title>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Rating</Text>
              <Rate value={formRating} onChange={setFormRating} style={{ fontSize: '28px' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Title</Text>
              <Input
                placeholder="Summarize your experience"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Your Review</Text>
              <Input.TextArea
                placeholder="Tell others about your experience with this breeder..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>
            <Space>
              <Button
                type="primary"
                style={{ background: '#08979C', borderColor: '#08979C' }}
                onClick={handleSubmitReview}
                loading={submitting}
                disabled={submitting || formRating === 0 || !formTitle.trim() || !formContent.trim()}
              >
                Submit Review
              </Button>
              <Button onClick={() => { setShowForm(false); setFormRating(0); setFormTitle(''); setFormContent(''); }} disabled={submitting}>
                Cancel
              </Button>
            </Space>
          </Card>
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            style={{ background: '#08979C', borderColor: '#08979C', marginBottom: '16px' }}
            onClick={() => setShowForm(true)}
          >
            Write a Review
          </Button>
        )
      ) : (
        <Card style={{ ...cardStyle, background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LockOutlined style={{ color: '#999' }} />
            <Text type="secondary">
              <Link href="/auth/signin" style={{ color: '#08979C' }}>Sign in</Link> to leave a review
            </Text>
          </div>
        </Card>
      )}
    </>
  );

  if (reviews.length === 0) {
    return (
      <div>
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <StarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4}>No Reviews Yet</Title>
            <Paragraph style={{ fontSize: '16px' }}>
              Be the first to leave a review for {breeder.businessName}!
            </Paragraph>
          </div>
        </Card>
        {reviewFormBlock}
      </div>
    );
  }

  return (
    <div>
      {/* Overall Rating Summary */}
      <Card style={cardStyle}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#08979C', lineHeight: 1.2 }}>
              {avgRating.toFixed(1)}
            </div>
            <Rate disabled value={avgRating} allowHalf style={{ fontSize: '20px' }} />
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
            </div>
          </Col>
          <Col xs={24} sm={16}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star - 1];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <Text style={{ width: '50px', fontSize: '13px' }}>{star} star</Text>
                  <div style={{
                    flex: 1,
                    height: '12px',
                    background: '#f0f0f0',
                    borderRadius: '6px',
                    marginLeft: '8px',
                    marginRight: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: '#fadb14',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <Text type="secondary" style={{ width: '30px', fontSize: '13px', textAlign: 'right' }}>
                    {count}
                  </Text>
                </div>
              );
            })}
          </Col>
        </Row>
      </Card>

      {/* Write a Review */}
      <div style={{ marginTop: '24px', marginBottom: '16px' }}>
        {reviewFormBlock}
      </div>

      {/* Individual Reviews */}
      <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        All Reviews ({reviews.length})
      </Title>
      {reviews.map((review) => (
        <Card key={review.id} style={{ ...cardStyle, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <Text strong style={{ fontSize: '15px' }}>{review.reviewerName}</Text>
              <div style={{ marginTop: '2px' }}>
                <Rate disabled value={review.rating} style={{ fontSize: '14px' }} />
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </div>
          <Title level={5} style={{ margin: '8px 0 4px 0' }}>{review.title}</Title>
          <Paragraph style={{ margin: 0, fontSize: '14px' }}>{review.content}</Paragraph>
        </Card>
      ))}
    </div>
  );
};

const BreederProfilePage: React.FC = () => {
  const params = useParams();
  const breederId = params?.id as string;
  const [activeTab, setActiveTab] = useState("posts");
  // Fetch breeder data
  const { data, error, isLoading } = useSWR<{ breeder: Breeder }>(
    breederId ? `/api/breeders/${breederId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const breeder = data?.breeder;
  const { user: authUser } = useAuth();
  const isOwnProfile = authUser && breeder && authUser.userId === String(breeder.userId);

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '16px',
        textAlign: 'center',
        paddingTop: '100px'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
          tip="Loading breeder profile..."
        />
      </div>
    );
  }

  // Error state
  if (error || !breeder) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Breeder Not Found"
          description="The breeder profile you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/breeders">
              <Button type="primary">Browse All Breeders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: '16px' }} items={[
        { title: <Link href="/"><HomeOutlined /> Home</Link> },
        { title: <Link href="/breeders">Breeders</Link> },
        { title: breeder.businessName },
      ]} />

      {/* Profile Header */}
      <Card style={{ ...cardStyle, marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={breeder.profileImage || '/api/placeholder/150/150'}
                alt={breeder.businessName}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #f0f0f0',
                  marginBottom: '16px'
                }}
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/150/150';
                }}
              />
              <div>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breeder.businessName}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {breeder.name}
                </Text>
                {breeder.verified && (
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green" icon={<StarOutlined />}>
                      Verified Breeder
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Space>
                      <EnvironmentOutlined style={{ color: '#08979C' }} />
                      <Text strong>{breeder.location}</Text>
                    </Space>
                  </div>
                  
                  <div>
                    <Space>
                      <TrophyOutlined style={{ color: '#FA8072' }} />
                      <Text strong>{breeder.experience} years experience</Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <TeamOutlined style={{ color: '#1890ff' }} />
                      <Text strong>
                        {breeder.currentLitters} active litter{breeder.currentLitters !== 1 ? 's' : ''}
                      </Text>
                    </Space>
                  </div>

                  <div>
                    <Space>
                      <StarOutlined style={{ color: '#52c41a' }} />
                      <Text strong>
                        {breeder.availablePuppies} available puppie{breeder.availablePuppies !== 1 ? 's' : ''}
                      </Text>
                    </Space>
                  </div>

                  {breeder.establishedYear && (
                    <div>
                      <Space>
                        <CalendarOutlined style={{ color: '#722ed1' }} />
                        <Text strong>Established {breeder.establishedYear}</Text>
                      </Space>
                    </div>
                  )}
                </Space>
              </Col>
              
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Rate disabled value={breeder.rating} allowHalf />
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {breeder.rating.toFixed(1)} out of 5 ({breeder.reviewCount} reviews)
                    </div>
                  </div>
                  
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<MailOutlined />}
                      style={{ background: '#FA8072', borderColor: '#FA8072' }}
                    >
                      Send Message
                    </Button>
                    <Button 
                      icon={<PhoneOutlined />}
                      onClick={() => window.open(`tel:${breeder.phone}`)}
                    >
                      Call Now
                    </Button>
                    <Button 
                      icon={<HeartOutlined />}
                    >
                      Add to Favorites
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Breeder Info */}
        <Col xs={24} lg={8}>
          {/* About */}
          <Card title="About" style={cardStyle}>
            <Paragraph style={{ fontSize: '14px' }}>{breeder.about}</Paragraph>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <a href={`tel:${breeder.phone}`} style={{ textDecoration: 'none' }}>
                  <Text>{breeder.phone}</Text>
                </a>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <a href={`mailto:${breeder.email}`} style={{ textDecoration: 'none' }}>
                  <Text>{breeder.email}</Text>
                </a>
              </div>
              
              {breeder.breederInfo?.website && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GlobalOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                  <a 
                    href={`https://${breeder.breederInfo?.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Text>{breeder.breederInfo?.website}</Text>
                  </a>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breeder.businessHours}</Text>
              </div>
            </Space>
          </Card>

          {/* Breeds */}
          <Card title="Breeds We Specialize In" style={cardStyle}>
            <Space wrap>
              {breeder.breeds.map(breed => (
                <Tag key={breed} color="blue" style={{ marginBottom: '4px' }}>
                  {breed}
                </Tag>
              ))}
            </Space>
          </Card>

          {/* Specialties */}
          {breeder.specialties.length > 0 && (
            <Card title="Specialties" style={cardStyle}>
              <Space wrap>
                {breeder.specialties.map(specialty => (
                  <Tag key={specialty} color="purple" style={{ marginBottom: '4px' }}>
                    {specialty}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Health Testing */}
          {breeder.healthTesting.length > 0 && (
            <Card title="Health Testing" style={cardStyle}>
              <Space wrap>
                {breeder.healthTesting.map(test => (
                  <Tag key={test} color="green" style={{ marginBottom: '4px' }}>
                    {test}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Certifications */}
          {breeder.certifications.length > 0 && (
            <Card title="Certifications & Memberships" style={cardStyle}>
              <Space wrap>
                {breeder.certifications.map(cert => (
                  <Tag key={cert} color="cyan" style={{ marginBottom: '4px' }}>
                    {cert}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Business Info */}
          <Card title="Business Information" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text strong>Response Rate: </Text>
                <Text>{Math.round(breeder.responseRate * 100)}%</Text>
              </div>
              
              <div>
                <Text strong>Avg Response Time: </Text>
                <Text>{breeder.avgResponseTime}</Text>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <Space wrap>
                  {breeder.shipping && (
                    <Tag color="blue" icon={<ShoppingOutlined />}>
                      Shipping Available
                    </Tag>
                  )}
                  {breeder.pickupAvailable && (
                    <Tag color="green" icon={<HomeOutlined />}>
                      Pickup Available
                    </Tag>
                  )}
                  {breeder.appointmentRequired && (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>
                      Appointment Required
                    </Tag>
                  )}
                </Space>
              </div>
            </Space>
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
              <BreederPostsTab breederId={breederId} cardStyle={cardStyle} />
            </TabPane>
            
            <TabPane tab="Available Puppies" key="available">
              <BreederPuppiesTab breederId={breederId} cardStyle={cardStyle} />
            </TabPane>
            
            <TabPane tab="Reviews" key="reviews">
              <BreederReviewsTab breederId={breederId} breeder={breeder} cardStyle={cardStyle} />
            </TabPane>

            <TabPane tab="Gallery" key="gallery">
              <BreederGalleryTab breederId={breederId} breeder={breeder} cardStyle={cardStyle} />
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Social Media Links */}
      {Object.keys(breeder.socialMedia).length > 0 && (
        <Card 
          title="Connect With Us" 
          style={{ marginTop: '24px', textAlign: 'center', ...cardStyle }}
        >
          <Space size="large">
            {Object.entries(breeder.socialMedia).map(([platform, url]) => (
              <Button
                key={platform}
                type="link"
                size="large"
                onClick={() => window.open(url, '_blank')}
                style={{ textTransform: 'capitalize' }}
              >
                {platform}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={{ marginTop: '24px', ...cardStyle }}>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={8}>
            <Button 
              type="primary" 
              block 
              size="large"
              icon={<MailOutlined />}
              style={{ background: '#FA8072', borderColor: '#FA8072' }}
            >
              Send Message
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              block 
              size="large"
              icon={<PhoneOutlined />}
              onClick={() => window.open(`tel:${breeder.phone}`)}
            >
              Call Now
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              block 
              size="large"
              icon={<HeartOutlined />}
            >
              Add to Favorites
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Breeders', url: '/breeders' },
          { name: breeder.businessName, url: `/breeders/${breeder.id}` }
        ])} 
      />
    </div>
  );
};

export default BreederProfilePage;
