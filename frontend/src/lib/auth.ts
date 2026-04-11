import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from './config';

class RPApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getBaseURL() {
    return getAPIBaseURL();
  }

  async getCurrentUser() {
    // localStorage에 저장된 토큰 확인
    const token = localStorage.getItem('access_token');
    if (!token) {
      return null; // 토큰 없으면 비로그인 상태
    }

    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // 토큰 만료 또는 무효 → localStorage 정리
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('token_type');
        return null;
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info'
      );
    }
  }

  async login() {
    // 백엔드가 HTTP 302 RedirectResponse를 반환하므로
    // axios 대신 window.location.href로 직접 이동
    const currentPath = window.location.pathname;
    window.location.href = `${this.getBaseURL()}/api/v1/auth/login?from_url=${encodeURIComponent(currentPath)}`;
  }

  async logout() {
    // localStorage 토큰 먼저 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('token_type');

    try {
      const token = localStorage.getItem('access_token'); // 이미 삭제됐으므로 null
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/logout`,
        { headers }
      );
      // 백엔드가 OIDC 로그아웃 URL 반환
      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        window.location.href = '/';
      }
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 이미 삭제됨 → 홈으로
      window.location.href = '/';
    }
  }
}

export const authApi = new RPApi();
