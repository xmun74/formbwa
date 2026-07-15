import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // 인증 토큰이 httpOnly 쿠키(Domain=.서비스도메인)라 web→api 서브도메인 요청에 쿠키를 실으려면 필수
  withCredentials: true,
  timeout: 10_000,
});
