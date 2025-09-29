import { message as antdMessage } from 'antd';

/**
 * Global message utility for use outside of React components
 * This should be used sparingly and only when the useMessage hook is not available
 */
export const message = {
  success: (content: string, duration?: number) => {
    return antdMessage.success(content, duration);
  },
  error: (content: string, duration?: number) => {
    return antdMessage.error(content, duration);
  },
  warning: (content: string, duration?: number) => {
    return antdMessage.warning(content, duration);
  },
  info: (content: string, duration?: number) => {
    return antdMessage.info(content, duration);
  },
  loading: (content: string, duration?: number) => {
    return antdMessage.loading(content, duration);
  }
};
