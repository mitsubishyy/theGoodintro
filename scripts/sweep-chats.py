#!/usr/bin/env python3
"""
sweep-chats.py — search every Claude Code chat you've ever had, and pull out
the text and images you shared.

Your chats are stored locally as .jsonl transcripts in ~/.claude/projects/.
Each pasted image is base64-encoded inside the transcript, so nothing you
shared is actually lost, it is just buried. This tool surfaces it.

USAGE
  # 1. Find which chats mention something (with context snippets + dates)
  python3 sweep-chats.py "hr partner"
  python3 sweep-chats.py "pricing"
  python3 sweep-chats.py "vendor workflow"

  # 2. Extract every image you pasted in the chats that match a keyword
  python3 sweep-chats.py "hr partner" --images ~/Desktop/recovered

  # 3. Extract every image from ONE specific chat (use the id from step 1)
  python3 sweep-chats.py --chat 7660f704 --images ~/Desktop/recovered

  # 4. List all your chats, newest first, with their first user message
  python3 sweep-chats.py --list

NOTES
  - Search is case-insensitive and treats "hr partner" / "hrpartner" alike.
  - Matching is on YOUR messages and Claude's replies (the text content).
  - Extracted images get a MANIFEST.txt mapping each file back to the chat,
    timestamp, and the message text it was attached to.
"""
import argparse, base64, glob, json, os, re, sys

PROJECTS = os.path.expanduser("~/.claude/projects")
EXT = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif"}


def all_transcripts():
    return sorted(glob.glob(os.path.join(PROJECTS, "**", "*.jsonl"), recursive=True))


def iter_messages(path):
    """Yield (line_index, timestamp, content_list) for each message in a transcript."""
    try:
        with open(path, errors="replace") as fh:
            for i, line in enumerate(fh):
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                msg = obj.get("message", obj)
                if not isinstance(msg, dict):
                    continue
                content = msg.get("content")
                if isinstance(content, str):
                    content = [{"type": "text", "text": content}]
                if not isinstance(content, list):
                    continue
                yield i, obj.get("timestamp", ""), msg.get("role", ""), content
    except Exception as e:
        print(f"  (skip {os.path.basename(path)}: {e})", file=sys.stderr)


def text_of(content):
    return " ".join(
        c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text"
    )


def norm(s):
    return re.sub(r"\s+", " ", s).lower().replace("hrpartner", "hr partner")


def cmd_search(term):
    needle = norm(term)
    hits = {}  # path -> list of (ts, role, snippet)
    img_counts = {}
    for path in all_transcripts():
        for i, ts, role, content in iter_messages(path):
            t = text_of(content)
            if needle in norm(t):
                snip = re.sub(r"\s+", " ", t).strip()
                idx = norm(snip).find(needle)
                start = max(0, idx - 50)
                snippet = ("..." if start else "") + snip[start:start + 160]
                hits.setdefault(path, []).append((ts, role, snippet))
            for c in content:
                if isinstance(c, dict) and c.get("type") == "image":
                    img_counts[path] = img_counts.get(path, 0) + 1
    if not hits:
        print(f'No chats mention "{term}".')
        return
    print(f'Chats mentioning "{term}":\n')
    for path in sorted(hits, key=lambda p: os.path.getmtime(p), reverse=True):
        cid = os.path.basename(path).split(".")[0]
        n_img = img_counts.get(path, 0)
        print(f"  chat {cid[:8]}   ({len(hits[path])} mentions, {n_img} images in chat)")
        for ts, role, snippet in hits[path][:3]:
            who = "you" if role == "user" else "claude"
            print(f"      [{ts[:10]} {who}] {snippet}")
        print()
    print('Tip: extract images with  --chat <id>  --images <folder>')


def cmd_extract(match_term, chat_id, outdir):
    os.makedirs(outdir, exist_ok=True)
    needle = norm(match_term) if match_term else None
    manifest = []
    total = 0
    for path in all_transcripts():
        cid = os.path.basename(path).split(".")[0]
        if chat_id and not cid.startswith(chat_id):
            continue
        if needle:
            joined = " ".join(norm(text_of(c)) for _, _, _, c in iter_messages(path))
            if needle not in joined:
                continue
        n_in_chat = 0
        for i, ts, role, content in iter_messages(path):
            ctx = re.sub(r"\s+", " ", text_of(content))[:160]
            for c in content:
                if isinstance(c, dict) and c.get("type") == "image":
                    src = c.get("source", {})
                    if src.get("type") != "base64":
                        continue
                    ext = EXT.get(src.get("media_type", "image/png"), "png")
                    n_in_chat += 1
                    total += 1
                    fn = f"{cid[:8]}_{i}_{n_in_chat}.{ext}"
                    try:
                        with open(os.path.join(outdir, fn), "wb") as o:
                            o.write(base64.b64decode(src.get("data", "")))
                        manifest.append((fn, ts, ctx))
                    except Exception as e:
                        print("  decode fail", fn, e, file=sys.stderr)
        if n_in_chat:
            print(f"  {n_in_chat:3d} images from chat {cid[:8]}")
    if manifest:
        with open(os.path.join(outdir, "MANIFEST.txt"), "w") as m:
            for fn, ts, ctx in manifest:
                m.write(f"{fn}\t{ts}\t{ctx}\n")
    print(f"\nExtracted {total} images to {outdir}")
    if total:
        print("See MANIFEST.txt for which chat/message each came from.")


def cmd_list():
    rows = []
    for path in all_transcripts():
        if "/subagents/" in path:
            continue
        first = ""
        for _, ts, role, content in iter_messages(path):
            if role == "user":
                first = re.sub(r"\s+", " ", text_of(content)).strip()[:80]
                if first:
                    rows.append((os.path.getmtime(path), os.path.basename(path).split(".")[0], ts[:10], first))
                    break
    rows.sort(reverse=True)
    for _, cid, day, first in rows:
        print(f"  {day}  {cid[:8]}  {first}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Search and recover content from past Claude Code chats.")
    ap.add_argument("term", nargs="?", help="keyword to search for")
    ap.add_argument("--images", metavar="DIR", help="extract pasted images to DIR")
    ap.add_argument("--chat", metavar="ID", help="limit to one chat id (prefix ok)")
    ap.add_argument("--list", action="store_true", help="list all chats newest-first")
    args = ap.parse_args()

    if args.list:
        cmd_list()
    elif args.images:
        cmd_extract(args.term, args.chat, os.path.expanduser(args.images))
    elif args.term:
        cmd_search(args.term)
    else:
        ap.print_help()
