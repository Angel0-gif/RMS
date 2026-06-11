"""
Mobile Money payments (MTN MoMo & Orange Money) via CamPay.

Modes (set CAMPAY_MODE env var):
  - simulate : no external calls; payments auto-succeed ~10s after initiation.
                Perfect for offline demos. (default)
  - demo     : CamPay sandbox (https://demo.campay.net). Requires demo app
                credentials from your CamPay dashboard. No real money moves.
  - live     : CamPay production. Real money. Requires a verified CamPay account.

CamPay docs: https://documenter.getpostman.com/view/2391374/T1LV8PVA
"""
import uuid

import requests
from django.conf import settings
from django.utils import timezone


class CamPayError(Exception):
    """Raised when a CamPay API call fails in a known way."""


def _base_url() -> str:
    if settings.CAMPAY_MODE == 'live':
        return 'https://www.campay.net/api'
    return 'https://demo.campay.net/api'


def _token() -> str:
    if not settings.CAMPAY_APP_USERNAME or not settings.CAMPAY_APP_PASSWORD:
        raise CamPayError(
            'CamPay credentials are not configured. '
            'Set CAMPAY_APP_USERNAME and CAMPAY_APP_PASSWORD, '
            'or use CAMPAY_MODE=simulate.'
        )
    try:
        r = requests.post(
            f'{_base_url()}/token/',
            json={
                'username': settings.CAMPAY_APP_USERNAME,
                'password': settings.CAMPAY_APP_PASSWORD,
            },
            timeout=20,
        )
    except requests.RequestException as exc:
        raise CamPayError(f'Could not reach CamPay: {exc}') from exc
    if r.status_code != 200:
        raise CamPayError('CamPay authentication failed. Check your app credentials.')
    return r.json().get('token', '')


def guess_operator(phone: str) -> str:
    """Rough operator guess from Cameroonian prefixes (CamPay auto-detects for real)."""
    local = phone[3:] if phone.startswith('237') else phone
    if local.startswith('69') or local[:3] in ('655', '656', '657', '658', '659'):
        return 'ORANGE'
    return 'MTN'


def collect(amount, phone: str, description: str, external_reference: str) -> dict:
    """Initiate a collection (payment request pushed to the customer's phone)."""
    if settings.CAMPAY_MODE == 'simulate':
        return {'reference': f'SIM-{uuid.uuid4()}', 'operator': guess_operator(phone)}

    headers = {'Authorization': f'Token {_token()}'}
    payload = {
        'amount': str(int(float(amount))),  # CamPay expects whole XAF as string
        'currency': 'XAF',
        'from': phone,
        'description': description[:100],
        'external_reference': str(external_reference),
    }
    try:
        r = requests.post(f'{_base_url()}/collect/', json=payload, headers=headers, timeout=30)
        data = r.json()
    except requests.RequestException as exc:
        raise CamPayError(f'Could not reach CamPay: {exc}') from exc
    except ValueError as exc:
        raise CamPayError('Unexpected response from CamPay.') from exc

    if r.status_code not in (200, 201) or 'reference' not in data:
        raise CamPayError(data.get('message') or 'Payment initiation failed.')
    return data


def transaction_status(reference: str, initiated_at=None) -> dict:
    """Check a transaction. Returns at least {'status': PENDING|SUCCESSFUL|FAILED}."""
    if settings.CAMPAY_MODE == 'simulate':
        elapsed = (timezone.now() - initiated_at).total_seconds() if initiated_at else 0
        return {'status': 'SUCCESSFUL' if elapsed >= 10 else 'PENDING'}

    headers = {'Authorization': f'Token {_token()}'}
    try:
        r = requests.get(f'{_base_url()}/transaction/{reference}/', headers=headers, timeout=20)
        data = r.json()
    except requests.RequestException as exc:
        raise CamPayError(f'Could not reach CamPay: {exc}') from exc
    except ValueError as exc:
        raise CamPayError('Unexpected response from CamPay.') from exc
    return data
