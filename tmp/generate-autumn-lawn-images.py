from __future__ import annotations

import base64
import json
import os
from pathlib import Path

import boto3
import requests

PROJECT_DIR = Path('/root/gardenyx')
OUTPUT_DIR = PROJECT_DIR / 'tmp' / 'hnojenie-travnika-na-jesen'
PREFIX = 'gardenyx/articles/hnojenie-travnika-na-jesen'
CDN_DOMAIN = 'https://cdn.gardenyx.eu'


def load_env(path: Path) -> None:
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env(PROJECT_DIR / '.env.local')
load_env(Path('/root/.hermes/.env'))

required = ['OPENROUTER_API_KEY', 'R2_ENDPOINT', 'R2_BUCKET', 'R2_ACCESS_KEY', 'R2_SECRET_KEY']
missing = [name for name in required if not os.environ.get(name)]
if missing:
    raise RuntimeError(f'Missing required environment variables: {", ".join(missing)}')

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
s3 = boto3.client(
    's3',
    endpoint_url=os.environ['R2_ENDPOINT'],
    aws_access_key_id=os.environ['R2_ACCESS_KEY'],
    aws_secret_access_key=os.environ['R2_SECRET_KEY'],
    region_name='auto',
)

images = [
    (
        'hnojenie-travnika-na-jesen-hero-20260917.png',
        'Wide editorial garden photograph, a healthy deep-green lawn in early autumn with a gardener evenly applying an autumn lawn fertilizer using a handheld spreader, golden decididuous trees softly blurred in the background, late afternoon natural light, realistic European home garden, no text, no logos, no watermark',
    ),
    (
        'jesenne-kosenie-travnika-20260917.png',
        'Realistic close-up editorial photograph of a gardener mowing a healthy lawn at a moderate height in early autumn, crisp grass blades and a push mower, soft morning dew, warm autumn foliage in the distance, natural garden scene, no text, no logos, no watermark',
    ),
    (
        'zdravy-travnik-pred-zimou-20260917.png',
        'Wide realistic editorial photograph of a dense healthy green lawn prepared for winter, autumn leaves scattered lightly on the grass, a rake resting naturally at the side, clean well-kept European garden, soft cloudy autumn daylight, no text, no logos, no watermark',
    ),
]

headers = {
    'Authorization': f"Bearer {os.environ['OPENROUTER_API_KEY']}",
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://www.gardenyx.eu',
    'X-Title': 'GardenYX',
}

for filename, prompt in images:
    print(f'Generating {filename}…')
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers=headers,
        json={
            'model': 'google/gemini-2.5-flash-image',
            'messages': [{'role': 'user', 'content': prompt}],
            'modalities': ['image', 'text'],
        },
        timeout=180,
    )
    response.raise_for_status()
    payload = response.json()
    image_url = payload['choices'][0]['message']['images'][0]['image_url']['url']
    if not image_url.startswith('data:image/'):
        raise RuntimeError(f'Expected a base64 image response for {filename}')
    image_data = base64.b64decode(image_url.split(',', 1)[1])
    local_path = OUTPUT_DIR / filename
    local_path.write_bytes(image_data)

    key = f'{PREFIX}/{filename}'
    s3.put_object(
        Bucket=os.environ['R2_BUCKET'],
        Key=key,
        Body=image_data,
        ContentType='image/png',
        CacheControl='public, max-age=31536000, immutable',
    )
    print(json.dumps({'local_path': str(local_path), 'key': key, 'public_url': f'{CDN_DOMAIN}/{key}'}))
