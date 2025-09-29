import { App } from 'antd';

/**
 * Custom hook for displaying messages throughout the app
 * Provides a consistent API for success, error, warning, and info messages
 */
export const useMessage = () => {
  const { message } = App.useApp();

  return {
    success: (content: string, duration?: number) => {
      return message.success(content, duration);
    },
    error: (content: string, duration?: number) => {
      return message.error(content, duration);
    },
    warning: (content: string, duration?: number) => {
      return message.warning(content, duration);
    },
    info: (content: string, duration?: number) => {
      return message.info(content, duration);
    },
    loading: (content: string, duration?: number) => {
      return message.loading(content, duration);
    }
  };
};
