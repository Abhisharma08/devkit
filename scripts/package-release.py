#!/usr/bin/env python3
"""Package verified static outputs; archive paths are relative to each app root."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
VERSION = json.loads((ROOT / 'package.json').read_text())['version']
OUTPUT = ROOT / 'release'
OUTPUT.mkdir(exist_ok=True)


def archive(name, source, required):
    for relative in required:
        if not (source / relative).is_file():
            raise SystemExit(f'Missing {source / relative}; run production builds first.')
    target = OUTPUT / f'devkit-{name}-{VERSION}.zip'
    with ZipFile(target, 'w', compression=ZIP_DEFLATED, compresslevel=9) as package:
        for path in sorted(source.rglob('*')):
            if not path.is_file() or path.is_symlink() or path.name == '.DS_Store':
                continue
            relative = path.relative_to(source).as_posix()
            info = ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            package.writestr(info, path.read_bytes(), compresslevel=9)
    with ZipFile(target) as package:
        if package.testzip() is not None:
            raise SystemExit(f'Archive validation failed: {target}')
        for relative in required:
            if relative not in package.namelist():
                raise SystemExit(f'Archive root is incorrect: {relative} missing')
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    print(f'{target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)')
    return target.name, digest


extension = ROOT / 'apps/extension/.output/chrome-mv3'
manifest = json.loads((extension / 'manifest.json').read_text())
if manifest['version'] != VERSION or manifest['manifest_version'] != 3:
    raise SystemExit('Root version and MV3 extension manifest must match.')
entries = [
    archive('cloudflare-pages', ROOT / 'apps/web/out', ['index.html', 'privacy/index.html', '_headers']),
    archive('chrome', extension, ['manifest.json', 'popup.html', 'sidepanel.html', 'workspace.html', 'icon/128.png']),
]
(OUTPUT / 'SHA256SUMS.txt').write_text(''.join(f'{digest}  {name}\n' for name, digest in entries))
print('Release ZIPs and SHA256SUMS.txt are ready. Publishing requires account access.')
