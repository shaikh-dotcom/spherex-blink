from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
TOTAL = 4500
SR = 48000
SPF = SR // FPS
VOICE_TS = ROOT / "src" / "config" / "voice.ts"
OUT_WAV = ROOT / "public" / "audio" / "voice.wav"
OUT_REPORT = ROOT / "out" / "voice-timing.txt"

TARGET_RMS_DB = -19.0
PEAK_LIMIT = 0.89
EDGE_FADE_S = 0.008
TRIM_DB = -48.0
END_MARGIN = 6
SILENT_TAIL = 20
SIL_GUARD_BEFORE = 6
SIL_GUARD_AFTER = 4

SPOKEN = [
    (r"\bSPHEREx\b", "Sphere X"),
    (r"\bCSV\b", "C S V"),
    (r"\bJSON\b", "J S O N"),
]


def read_blocks() -> list[dict]:
    if not VOICE_TS.exists():
        sys.exit("ERROR: src/config/voice.ts not found. Fix: restore it from git.")
    src = VOICE_TS.read_text(encoding="utf-8")
    m = re.search(r"export const voiceBlocks\s*=\s*\[(.*?)\]\s*as const", src, re.S)
    if not m:
        sys.exit("ERROR: voiceBlocks not found in src/config/voice.ts. Fix: restore voice.ts from git.")
    pat = re.compile(r'id:\s*"(V\d+)"\s*,\s*start:\s*(\d+)\s*,\s*text:\s*"((?:[^"\\]|\\.)*)"', re.S)
    blocks = [
        {"id": i, "start": int(s), "text": t.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ")}
        for i, s, t in pat.findall(m.group(1))
    ]
    if not blocks:
        sys.exit("ERROR: could not read any block from voiceBlocks in src/config/voice.ts.")
    blocks.sort(key=lambda b: b["start"])
    for a, b in zip(blocks, blocks[1:]):
        if a["start"] == b["start"]:
            sys.exit(f"ERROR: {a['id']} and {b['id']} start on the same frame ({a['start']}). Fix: move one in src/config/voice.ts.")
    if blocks[0]["start"] < 0 or blocks[-1]["start"] >= TOTAL - SILENT_TAIL:
        sys.exit(f"ERROR: every block must start between frame 0 and frame {TOTAL - SILENT_TAIL - 1}.")
    return blocks


def sentences(text: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", text.strip()) if p.strip()]
    return parts or [text.strip()]


def spoken(text: str) -> str:
    for pattern, repl in SPOKEN:
        text = re.sub(pattern, repl, text)
    return text


def trim(a: np.ndarray) -> np.ndarray:
    thr = 10 ** (TRIM_DB / 20)
    idx = np.flatnonzero(np.abs(a) > thr)
    if idx.size == 0:
        return a
    pad = int(0.01 * SR)
    return a[max(0, idx[0] - pad): min(a.size, idx[-1] + pad)]


def fade(a: np.ndarray) -> np.ndarray:
    n = min(int(EDGE_FADE_S * SR), a.size // 2)
    if n > 0:
        ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
        a = a.copy()
        a[:n] *= ramp
        a[-n:] *= ramp[::-1]
    return a


def rms_db(a: np.ndarray) -> float:
    return 20 * np.log10(max(float(np.sqrt(np.mean(a ** 2))), 1e-9))


def tempo(a: np.ndarray, factor: float) -> np.ndarray:
    if abs(factor - 1.0) < 1e-3:
        return a
    from scipy.io import wavfile

    with tempfile.TemporaryDirectory() as d:
        src, dst = Path(d) / "in.wav", Path(d) / "out.wav"
        wavfile.write(src, SR, (np.clip(a, -1, 1) * 32767).astype(np.int16))
        r = subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(src), "-filter:a", f"atempo={factor:.4f}", str(dst)],
            capture_output=True, text=True,
        )
        if r.returncode != 0:
            sys.exit(f"ERROR: ffmpeg atempo failed: {r.stderr.strip()}\nFix: make sure ffmpeg works (ffmpeg -version).")
        sr, out = wavfile.read(dst)
        return out.astype(np.float32) / 32768.0


def place(durs: list[int], start: int, gap: int, sil: tuple[int, int] | None, limit: int):
    spots, t = [], start
    for d in durs:
        if sil and t < sil[1] + SIL_GUARD_AFTER and t + d > sil[0] - SIL_GUARD_BEFORE:
            t = sil[1] + SIL_GUARD_AFTER
        spots.append((t, t + d))
        t += d + gap
    return spots if spots[-1][1] <= limit else None


def schedule(clips: list[np.ndarray], start: int, gap: int, sil, limit: int, max_tempo: float):
    f = 1.0
    while True:
        durs = [int(np.ceil(c.size / SPF / f)) for c in clips]
        spots = place(durs, start, gap, sil, limit)
        if spots is not None:
            return f, spots, True
        if f >= max_tempo - 1e-9:
            return f, place(durs, start, gap, sil, 10 ** 9), False
        f = min(max_tempo, round(f + 0.01, 2))


def main() -> None:
    ap = argparse.ArgumentParser(description="Frame-accurate voice-over for the SPHEREx Blink film, made locally with Pocket TTS.")
    ap.add_argument("--voice", default="jane", help="built-in voice name or path of a wav/mp3 to clone (default: jane)")
    ap.add_argument("--max-tempo", type=float, default=1.25, help="never speed a block up more than this (default 1.25)")
    ap.add_argument("--gap", type=int, default=8, help="frames of pause between the sentences of a block (default 8)")
    ap.add_argument("--silence", default="none", help="frames where nothing may sound, 'from-to', or 'none' (default none)")
    ap.add_argument("--level", type=float, default=TARGET_RMS_DB, help=f"speech level in dB RMS before limiting (default {TARGET_RMS_DB})")
    ap.add_argument("--dry-run", action="store_true", help="no model: print the schedule estimated from word counts")
    args = ap.parse_args()

    sil = None if args.silence == "none" else tuple(int(x) for x in args.silence.split("-"))
    blocks = read_blocks()
    print(f"{len(blocks)} voice blocks read from src/config/voice.ts: " + ", ".join(f"{b['id']}@f{b['start']}" for b in blocks))

    model = state = None
    if not args.dry_run:
        try:
            from pocket_tts import TTSModel
        except ImportError:
            sys.exit("ERROR: pocket-tts is not installed. Fix: run make-voice.bat (it installs it), or: pip install pocket-tts")
        print(f"Loading Pocket TTS and the voice '{args.voice}' (first run downloads the model, about a minute)...")
        model = TTSModel.load_model()
        state = model.get_state_for_audio_prompt(args.voice)
        print(f"Model ready, {model.sample_rate} Hz.")

    from scipy.signal import resample_poly

    def speak(text: str) -> np.ndarray:
        if args.dry_run:
            n = int(len(text.split()) * 60 / 165 * SR)
            return np.full(n, 0.1, dtype=np.float32)
        wav = model.generate_audio(state, spoken(text), copy_state=True).detach().cpu().numpy().astype(np.float32).reshape(-1)
        wav = resample_poly(wav, SR, int(model.sample_rate)).astype(np.float32)
        wav = trim(wav)
        gain = 10 ** ((args.level - rms_db(wav)) / 20)
        return wav * gain

    track = np.zeros(TOTAL * SPF, dtype=np.float32)
    report = [f"voice: {args.voice}   silence: {args.silence}   max tempo: {args.max_tempo}   level: {args.level} dB RMS", ""]
    problems = 0
    last_allowed = TOTAL - SILENT_TAIL - END_MARGIN

    for i, b in enumerate(blocks):
        sents = sentences(b["text"])
        clips = []
        for k, s in enumerate(sents, 1):
            print(f"  {b['id']} sentence {k}/{len(sents)}: {s[:70]}{'...' if len(s) > 70 else ''}")
            clips.append(speak(s))
        limit = blocks[i + 1]["start"] - END_MARGIN if i + 1 < len(blocks) else last_allowed
        factor, spots, fits = schedule(clips, b["start"], args.gap, sil, limit, args.max_tempo)
        last_end = spots[-1][1]
        status = "ok" if fits else f"OVER by {(last_end - limit) / FPS:.2f} s"
        if not fits:
            problems += 1
        report.append(f"{b['id']}  starts f{b['start']}  tempo x{factor:.2f}  ends f{last_end}  (limit f{limit})  {status}")
        print(f"  -> {b['id']}: f{b['start']} to f{last_end}, tempo x{factor:.2f}, {status}")
        for k, (clip, (s0, s1)) in enumerate(zip(clips, spots), 1):
            sped = fade(tempo(clip, factor))
            a0 = s0 * SPF
            n = min(sped.size, track.size - a0)
            if n > 0:
                track[a0: a0 + n] += sped[:n]
            jumped = "  (after the silence)" if sil and s0 >= sil[1] and b["start"] < sil[0] else ""
            report.append(f"      sentence {k}: f{s0} - f{s1}{jumped}   {sents[k - 1][:60]}")

    if sil:
        track[sil[0] * SPF: (sil[1] + 1) * SPF] = 0.0
    track[(TOTAL - SILENT_TAIL) * SPF:] = 0.0

    peak = float(np.max(np.abs(track)))
    if peak > PEAK_LIMIT:
        track *= PEAK_LIMIT / peak
    report += ["", f"peak {20 * np.log10(max(peak, 1e-9)):.1f} dBFS before limiting", f"length {TOTAL} frames = {TOTAL / FPS:.2f} s"]

    OUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    OUT_REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n" + "\n".join(report))

    if args.dry_run:
        print("\nDry run: nothing written except out/voice-timing.txt.")
        return

    from scipy.io import wavfile

    OUT_WAV.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT_WAV, SR, (np.clip(track, -1, 1) * 32767).astype(np.int16))
    print(f"\nWrote {OUT_WAV.relative_to(ROOT)} ({track.size / SR:.2f} s, {SR} Hz, 16-bit, mono) and out/voice-timing.txt")
    if problems:
        print(f"WARNING: {problems} block(s) are longer than their slot even at x{args.max_tempo}. Shorten that text in "
              "src/config/voice.ts or raise --max-tempo, then run again.")


if __name__ == "__main__":
    main()
