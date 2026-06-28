"use client";

import { useEffect, useState } from "react";
import { Check, Lock, Pencil, Plus, TriangleAlert, X } from "lucide-react";

type Item = { id: number; value: string; inUse?: boolean };
type Kind = "user" | "location";

function Chip({
  item,
  onRename,
  onRemove,
}: {
  item: Item;
  onRename: (id: number, value: string) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.value);
  const [busy, setBusy] = useState(false);

  async function save() {
    const v = value.trim();
    if (!v || busy) return;
    if (v === item.value) {
      setEditing(false);
      return;
    }
    setBusy(true);
    await onRename(item.id, v);
    setBusy(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex w-full items-center gap-1 border border-black/20 bg-white px-2 py-1.5 text-[12px]">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              setValue(item.value);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-black outline-none"
        />
        <button type="button" onClick={save} aria-label="保存" className="shrink-0 px-1 text-green-700 hover:text-green-800">
          <Check size={15} />
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(item.value);
            setEditing(false);
          }}
          aria-label="キャンセル"
          className="shrink-0 px-1 text-black/40 hover:text-black/70"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 border border-black/10 bg-black/[0.03] py-1.5 pl-2.5 pr-1.5 text-[12px] text-black/75">
      <span className="min-w-0 truncate">{item.value}</span>
      <span className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => {
            setValue(item.value);
            setEditing(true);
          }}
          aria-label="編集"
          className="rounded p-1 text-black/40 transition-colors hover:bg-black/5 hover:text-black/70"
        >
          <Pencil size={13} />
        </button>
        {item.inUse ? (
          <span title="使用中の予約・履歴があるため削除できません" className="p-1 text-black/25" aria-label="使用中（削除不可）">
            <Lock size={13} />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="削除"
            className="rounded p-1 text-black/40 transition-colors hover:bg-red-500/10 hover:text-red-600"
          >
            <X size={13} />
          </button>
        )}
      </span>
    </div>
  );
}

function ItemList({
  title,
  kind,
  placeholder,
  items,
  onAdd,
  onRename,
  onRemove,
}: {
  title: string;
  kind: Kind;
  placeholder: string;
  items: Item[];
  onAdd: (kind: Kind, value: string) => Promise<void>;
  onRename: (id: number, value: string) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v || busy) return;
    setBusy(true);
    await onAdd(kind, v);
    setValue("");
    setBusy(false);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="font-mono text-[10px] tracking-[0.25em] text-black/45">{title}</div>

      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <span className="text-[12px] text-black/35">未登録</span>
        ) : (
          items.map((it) => <Chip key={it.id} item={it} onRename={onRename} onRemove={onRemove} />)
        )}
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="hud-input flex-1"
        />
        <button
          type="submit"
          disabled={busy || value.trim() === ""}
          className="inline-flex shrink-0 items-center gap-1 border border-black/15 px-4 text-[12px] font-bold tracking-widest text-black/70 transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} /> 追加
        </button>
      </form>
    </div>
  );
}

/**
 * onChanged: 設定が変わったら親（HangarApp）に通知して再取得させる
 * refreshKey: 予約の作成・取消・変更が起きるたびに変わる。使用中（inUse）判定を更新するため再取得する。
 */
export function SettingsPanel({ onChanged, refreshKey = 0 }: { onChanged?: () => void; refreshKey?: number }) {
  const [users, setUsers] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const d = (await fetch("/api/settings").then((r) => r.json())) as {
        users: Item[];
        locations: Item[];
      };
      setUsers(d.users ?? []);
      setLocations(d.locations ?? []);
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function add(kind: Kind, value: string) {
    setError(null);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, value }),
    }).catch(() => {});
    await refresh();
    onChanged?.();
  }

  async function rename(id: number, value: string) {
    setError(null);
    try {
      const res = await fetch(`/api/settings/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "編集できませんでした。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    }
    await refresh();
    onChanged?.();
  }

  async function remove(id: number) {
    setError(null);
    try {
      const res = await fetch(`/api/settings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "削除できませんでした。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    }
    await refresh();
    onChanged?.();
  }

  return (
    <div className="hud-frame p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.3em] text-black/40">SETTINGS</div>
        <div className="font-mono text-[10px] text-black/35">設定</div>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-1.5 border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[12px] text-red-600">
          <TriangleAlert size={13} className="shrink-0" /> {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <ItemList
          title="ユーザー名 / PILOTS"
          kind="user"
          placeholder="例: 山田 太郎"
          items={users}
          onAdd={add}
          onRename={rename}
          onRemove={remove}
        />
        <ItemList
          title="返却場所 / BASES"
          kind="location"
          placeholder="例: 本社 第3駐車場"
          items={locations}
          onAdd={add}
          onRename={rename}
          onRemove={remove}
        />
      </div>
    </div>
  );
}
