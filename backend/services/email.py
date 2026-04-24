import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

_RESEND_API_URL = "https://api.resend.com/emails"
_FROM_EMAIL = "noreply@sgmatch.co.kr"


async def get_user_email_by_id(user_id: str) -> Optional[str]:
    """Supabase Admin API로 user_id에 해당하는 이메일 주소를 조회한다.

    SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_URL이 없으면 None 반환.
    """
    supabase_url = os.environ.get("SUPABASE_URL", "")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not service_role_key:
        logger.warning(
            "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 미설정 — 이메일 조회 스킵"
        )
        return None

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{supabase_url}/auth/v1/admin/users/{user_id}",
                headers={
                    "apikey": service_role_key,
                    "Authorization": f"Bearer {service_role_key}",
                },
            )
        if resp.status_code == 200:
            email = resp.json().get("email")
            logger.debug("유저 이메일 조회 성공 (user_id: %s...)", user_id[:8])
            return email
        logger.warning(
            "유저 이메일 조회 실패: status=%s", resp.status_code
        )
        return None
    except Exception as exc:
        logger.error("유저 이메일 조회 중 오류: %s", exc)
        return None


async def _send_email(to: str, subject: str, html: str) -> bool:
    """Resend API를 통해 이메일을 발송하는 내부 헬퍼.

    RESEND_API_KEY가 없으면 로그만 남기고 False 반환.
    """
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key:
        logger.warning("RESEND_API_KEY 미설정 — 이메일 발송 스킵")
        return False

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _RESEND_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": _FROM_EMAIL,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
        if resp.status_code in (200, 201):
            logger.info("이메일 발송 성공: to=%s, subject=%s", to, subject)
            return True
        logger.error(
            "Resend API 오류: status=%s, body=%s", resp.status_code, resp.text
        )
        return False
    except Exception as exc:
        logger.error("이메일 발송 중 오류: %s", exc)
        return False


async def send_approval_email(to_email: str, agency_name: str) -> bool:
    """지사 승인 완료 이메일을 발송한다."""
    subject = f"[SpeedGang Match] {agency_name} 지사 승인 완료"
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- 헤더 -->
        <tr>
          <td style="background:#111111;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              SpeedGang<span style="color:#e63946;">Match</span>
            </span>
          </td>
        </tr>
        <!-- 아이콘 영역 -->
        <tr>
          <td style="padding:44px 40px 0;text-align:center;">
            <div style="display:inline-block;width:72px;height:72px;background:#d1fae5;
                        border-radius:50%;line-height:72px;font-size:36px;text-align:center;">
              ✅
            </div>
          </td>
        </tr>
        <!-- 본문 -->
        <tr>
          <td style="padding:24px 40px 44px;text-align:center;">
            <h1 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#111111;">
              지사 승인 완료
            </h1>
            <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.75;">
              축하합니다! <strong style="color:#059669;">{agency_name}</strong> 지사가<br>
              SpeedGang Match에서 정식 승인되었습니다.
            </p>
            <p style="margin:0 0 36px;font-size:14px;color:#6b7280;line-height:1.7;">
              이제 공고를 등록하고 라이더를 모집할 수 있습니다.<br>
              대시보드에서 바로 시작해보세요.
            </p>
            <a href="https://www.sgmatch.co.kr/agency"
               style="display:inline-block;padding:15px 36px;background:#e63946;color:#ffffff;
                      font-size:15px;font-weight:700;border-radius:10px;text-decoration:none;
                      letter-spacing:-0.2px;">
              대시보드로 이동
            </a>
          </td>
        </tr>
        <!-- 구분선 + 푸터 -->
        <tr>
          <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;
                     text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              SpeedGang Match &nbsp;·&nbsp; noreply@sgmatch.co.kr<br>
              본 메일은 발신 전용입니다. 문의: support@sgmatch.co.kr
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    return await _send_email(to_email, subject, html)


async def send_rejection_email(to_email: str, agency_name: str) -> bool:
    """지사 승인 거절 이메일을 발송한다."""
    subject = f"[SpeedGang Match] {agency_name} 지사 승인 거절"
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;">
    <tr><td align="center" style="padding:48px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- 헤더 -->
        <tr>
          <td style="background:#111111;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              SpeedGang<span style="color:#e63946;">Match</span>
            </span>
          </td>
        </tr>
        <!-- 아이콘 영역 -->
        <tr>
          <td style="padding:44px 40px 0;text-align:center;">
            <div style="display:inline-block;width:72px;height:72px;background:#fee2e2;
                        border-radius:50%;line-height:72px;font-size:36px;text-align:center;">
              ❌
            </div>
          </td>
        </tr>
        <!-- 본문 -->
        <tr>
          <td style="padding:24px 40px 44px;text-align:center;">
            <h1 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#111111;">
              지사 승인 거절
            </h1>
            <p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.75;">
              <strong style="color:#dc2626;">{agency_name}</strong> 지사의<br>
              승인 신청이 거절되었습니다.
            </p>
            <p style="margin:0 0 36px;font-size:14px;color:#6b7280;line-height:1.7;">
              서류 미비 또는 기재 내용 오류가 원인일 수 있습니다.<br>
              정보를 수정하신 후 다시 신청해 주세요.
            </p>
            <a href="https://www.sgmatch.co.kr/agency/verification"
               style="display:inline-block;padding:15px 36px;background:#374151;color:#ffffff;
                      font-size:15px;font-weight:700;border-radius:10px;text-decoration:none;
                      letter-spacing:-0.2px;">
              서류 재제출
            </a>
          </td>
        </tr>
        <!-- 구분선 + 푸터 -->
        <tr>
          <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;
                     text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              SpeedGang Match &nbsp;·&nbsp; noreply@sgmatch.co.kr<br>
              본 메일은 발신 전용입니다. 문의: support@sgmatch.co.kr
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    return await _send_email(to_email, subject, html)
