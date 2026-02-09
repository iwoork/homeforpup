'use client';

import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Tabs, Image, Tag, Space,
  Spin, Alert, Input, message, Button, Tooltip, Breadcrumb, Select, Timeline
} from 'antd';
import {
  HomeOutlined, TeamOutlined, LoadingOutlined, LockOutlined,
  CommentOutlined, SendOutlined, HeartOutlined, HeartFilled,
  EditOutlined, DashboardOutlined, MedicineBoxOutlined,
  TrophyOutlined, StarOutlined
} from '@ant-design/icons';
import PhotoUpload from '@/components/forms/Upload/PhotoUpload';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useAuth } from '@homeforpup/shared-auth';

const { Title, Paragraph, Text } = Typography;

// Group interfaces
interface GroupData {
  id: string;
  name: string;
  description: string;
  groupType: 'litter' | 'custom';
  litterId?: string;
  breederId: string;
  coverPhoto?: string;
  createdAt: string;
  createdBy: string;
  memberCount: number;
}

interface GroupMember {
  groupId: string;
  userId: string;
  userName: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

// Post type from the /api/posts endpoint
interface PostFromApi {
  id: string;
  authorId: string;
  authorName: string;
  breederId: string;
  groupId?: string;
  title: string;
  content: string;
  postType: 'litter' | 'health' | 'achievement' | 'event' | 'available' | 'general';
  photos: string[];
  tags: string[];
  createdAt: string;
}

// Comment type
interface CommentFromApi {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Reaction data
interface ReactionsData {
  counts: Record<string, number>;
  total: number;
  userReaction: string | null;
}

// Milestone type
interface MilestoneFromApi {
  id: string;
  litterId: string;
  breederId: string;
  title: string;
  description: string;
  milestoneType: 'weight' | 'health' | 'training' | 'social' | 'first';
  date: string;
  photos: string[];
  createdAt: string;
}

// Fetchers
const groupFetcher = async (url: string): Promise<{ group: GroupData }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch group');
  return response.json();
};

const membersFetcher = async (url: string): Promise<{ members: GroupMember[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch members');
  return response.json();
};

const postsFetcher = async (url: string): Promise<{ posts: PostFromApi[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

const commentsFetcher = async (url: string): Promise<{ comments: CommentFromApi[]; count: number }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

const reactionsFetcher = async (url: string): Promise<ReactionsData> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch reactions');
  return response.json();
};

const milestonesFetcher = async (url: string): Promise<{ milestones: MilestoneFromApi[] }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch milestones');
  return response.json();
};

const POST_TYPE_COLORS: Record<string, string> = {
  litter: 'blue',
  health: 'green',
  achievement: 'gold',
  event: 'purple',
  available: 'cyan',
  general: 'default',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: '16px',
};

// PostComments component
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

// PostLikeButton component
const PostLikeButton: React.FC<{ postId: string }> = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const { data: reactionsData, mutate: mutateReactions } = useSWR(
    `/api/posts/${postId}/reactions`,
    reactionsFetcher,
    { revalidateOnFocus: false }
  );

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticTotal, setOptimisticTotal] = useState<number | null>(null);

  const liked = optimisticLiked ?? (reactionsData?.userReaction !== null && reactionsData?.userReaction !== undefined);
  const total = optimisticTotal ?? (reactionsData?.total || 0);

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;

    const wasLiked = liked;
    const prevTotal = total;

    setOptimisticLiked(!wasLiked);
    setOptimisticTotal(wasLiked ? Math.max(0, prevTotal - 1) : prevTotal + 1);

    try {
      if (wasLiked) {
        const response = await fetch(`/api/posts/${postId}/reactions`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove reaction');
      } else {
        const response = await fetch(`/api/posts/${postId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType: 'like' }),
        });
        if (!response.ok) throw new Error('Failed to add reaction');
      }
      mutateReactions();
    } catch {
      setOptimisticLiked(wasLiked);
      setOptimisticTotal(prevTotal);
    } finally {
      setTimeout(() => {
        setOptimisticLiked(null);
        setOptimisticTotal(null);
      }, 500);
    }
  };

  const heartButton = (
    <Button
      type="text"
      icon={liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
      onClick={handleToggleLike}
      style={{ color: liked ? '#ff4d4f' : '#08979C', padding: '4px 8px' }}
    >
      {total > 0 ? total : ''}
    </Button>
  );

  if (!isAuthenticated) {
    return (
      <Tooltip title="Sign in to like">
        {heartButton}
      </Tooltip>
    );
  }

  return heartButton;
};

// Create Post Form component
const CreatePostForm: React.FC<{ groupId: string; onPostCreated: () => void }> = ({ groupId, onPostCreated }) => {
  const { mutate: globalMutate } = useSWRConfig();
  const [expanded, setExpanded] = useState(false);
  const [postType, setPostType] = useState<string>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('Please enter some content for your post');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          title: title.trim(),
          content: content.trim(),
          postType,
          photos,
          tags: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      // Reset form
      setTitle('');
      setContent('');
      setPostType('general');
      setPhotos([]);
      setExpanded(false);
      message.success('Post created!');
      globalMutate(`/api/posts?groupId=${groupId}`);
      onPostCreated();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ ...cardStyle, marginBottom: '16px' }}>
      {!expanded ? (
        <div
          onClick={() => setExpanded(true)}
          style={{
            padding: '8px 12px',
            background: '#f5f5f5',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <EditOutlined style={{ color: '#08979C' }} />
          <Text type="secondary">Share an update...</Text>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ fontSize: '15px' }}>Create Post</Text>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <Select
              value={postType}
              onChange={(value) => setPostType(value)}
              style={{ width: '200px' }}
              options={[
                { label: 'General', value: 'general' },
                { label: 'Litter Update', value: 'litter' },
                { label: 'Health', value: 'health' },
                { label: 'Achievement', value: 'achievement' },
                { label: 'Event', value: 'event' },
                { label: 'Available', value: 'available' },
              ]}
            />
          </div>
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: '12px' }}
          />
          <Input.TextArea
            placeholder="What's new?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{ marginBottom: '12px' }}
          />
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setExpanded(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting || !content.trim()}
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Group Posts Feed component
const GroupPostsFeed: React.FC<{ groupId: string }> = ({ groupId }) => {
  const { data: postsData, error: postsError, isLoading: postsLoading } = useSWR(
    groupId ? `/api/posts?groupId=${groupId}` : null,
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
          description="There was a problem fetching group posts. Please try again later."
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
            No one has shared any updates in this group yet. Check back soon!
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <PostLikeButton postId={post.id} />
          </div>
          <PostComments postId={post.id} />
        </Card>
      ))}
    </div>
  );
};

const MILESTONE_TYPE_ICONS: Record<string, React.ReactNode> = {
  weight: <DashboardOutlined style={{ color: '#08979C' }} />,
  health: <MedicineBoxOutlined style={{ color: '#52c41a' }} />,
  training: <TrophyOutlined style={{ color: '#faad14' }} />,
  social: <TeamOutlined style={{ color: '#722ed1' }} />,
  first: <StarOutlined style={{ color: '#eb2f96' }} />,
};

// Group Milestones Timeline component
const GroupMilestones: React.FC<{ litterId: string }> = ({ litterId }) => {
  const { data: milestonesData, error: milestonesError, isLoading: milestonesLoading } = useSWR(
    litterId ? `/api/milestones?litterId=${litterId}` : null,
    milestonesFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const milestones = milestonesData?.milestones || [];

  if (milestonesLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading milestones..." />
        </div>
      </Card>
    );
  }

  if (milestonesError) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Unable to load milestones"
          description="There was a problem fetching milestones. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <StarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4}>No milestones yet</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            Milestones will appear here as the breeder documents the puppies&apos; development.
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
      <Timeline
        items={milestones.map((milestone) => ({
          dot: MILESTONE_TYPE_ICONS[milestone.milestoneType] || <StarOutlined style={{ color: '#08979C' }} />,
          children: (
            <div style={{ paddingBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <Text strong style={{ fontSize: '15px' }}>{milestone.title}</Text>
                <Text type="secondary" style={{ fontSize: '13px', flexShrink: 0, marginLeft: '12px' }}>
                  {new Date(milestone.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </div>
              <Tag style={{ marginBottom: '6px' }}>
                {milestone.milestoneType.charAt(0).toUpperCase() + milestone.milestoneType.slice(1)}
              </Tag>
              {milestone.description && (
                <Paragraph style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#555' }}>
                  {milestone.description}
                </Paragraph>
              )}
              {milestone.photos && milestone.photos.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {milestone.photos.map((photo, idx) => (
                        <Col xs={8} sm={6} key={idx}>
                          <Image
                            src={photo}
                            alt={`${milestone.title} photo ${idx + 1}`}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                            }}
                            fallback="/api/placeholder/100/80"
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>
              )}
            </div>
          ),
        }))}
      />
    </Card>
  );
};

const GroupDetailPage: React.FC = () => {
  const params = useParams();
  const groupId = params?.id as string;
  const { user: authUser, isAuthenticated } = useAuth();

  // Fetch group details
  const { data: groupData, error: groupError, isLoading: groupLoading } = useSWR(
    groupId ? `/api/groups/${groupId}` : null,
    groupFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Fetch group members to check if current user is a member
  const { data: membersData } = useSWR(
    groupId ? `/api/groups/${groupId}/members` : null,
    membersFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const group = groupData?.group;
  const members = membersData?.members || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserId = authUser ? String((authUser as any).userId ?? '') : '';
  const isMember = isAuthenticated && authUser && members.some(
    (m) => m.userId === currentUserId
  );

  // Loading state
  if (groupLoading) {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '16px',
        textAlign: 'center',
        paddingTop: '100px'
      }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Loading group..."
        />
      </div>
    );
  }

  // Error / not found
  if (groupError || !group) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Group Not Found"
          description="The group you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/">
              <Button type="primary">Go Home</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }} items={[
        { title: <Link href="/"><HomeOutlined /> Home</Link> },
        { title: group.name },
      ]} />

      {/* Group Header */}
      <Card style={{ ...cardStyle, marginBottom: '24px', overflow: 'hidden' }}>
        {group.coverPhoto && (
          <div style={{
            height: '200px',
            margin: '-24px -24px 16px -24px',
            overflow: 'hidden',
          }}>
            <img
              src={group.coverPhoto}
              alt={group.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, color: '#08979C' }}>
            {group.name}
          </Title>
          {group.description && (
            <Paragraph style={{ fontSize: '16px', marginTop: '8px', marginBottom: '12px', color: '#666' }}>
              {group.description}
            </Paragraph>
          )}
          <Space size="middle">
            <Tag color={group.groupType === 'litter' ? 'blue' : 'purple'}>
              {group.groupType === 'litter' ? 'Litter Group' : 'Custom Group'}
            </Tag>
            <Space>
              <TeamOutlined style={{ color: '#08979C' }} />
              <Text strong>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</Text>
            </Space>
          </Space>
        </div>
      </Card>

      {/* Private group gate */}
      {!isMember ? (
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <LockOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4}>This is a private group</Title>
            <Paragraph style={{ fontSize: '16px' }}>
              You need to be a member of this group to view its content.
              {!isAuthenticated && (
                <>
                  {' '}
                  <Link href="/auth/signin" style={{ color: '#08979C' }}>Sign in</Link> to check your membership.
                </>
              )}
            </Paragraph>
          </div>
        </Card>
      ) : (
        <Tabs defaultActiveKey="posts" size="large">
          <Tabs.TabPane tab="Posts" key="posts">
            <CreatePostForm groupId={groupId} onPostCreated={() => {}} />
            <GroupPostsFeed groupId={groupId} />
          </Tabs.TabPane>
          {group.litterId && (
            <Tabs.TabPane tab="Milestones" key="milestones">
              <GroupMilestones litterId={group.litterId} />
            </Tabs.TabPane>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default GroupDetailPage;
