import { createClient } from '@metagptx/web-sdk';
import { getAPIBaseURL } from './config';

// SDK 클라이언트 생성 - baseURL을 명시적으로 지정하여
// 모든 API 요청이 백엔드(sgmatch.onrender.com)로 전달되도록 설정
// baseURL 미지정 시 현재 페이지 Origin(프론트엔드)으로 요청하는 문제 방지
export const client = createClient({
  baseURL: getAPIBaseURL(),
});

