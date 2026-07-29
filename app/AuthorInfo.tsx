"use client";

import { useEffect, useRef, useState } from "react";

export default function AuthorInfo() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button className="author-trigger" type="button" onClick={() => setOpen(true)}>
        作者信息
      </button>
      <dialog
        className="author-dialog"
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <button className="dialog-close" type="button" onClick={() => setOpen(false)} aria-label="关闭作者信息">
          ×
        </button>
        <p className="dialog-kicker">ABOUT THE PROJECT</p>
        <h2>乡音楚韵</h2>
        <dl>
          <div>
            <dt>项目</dt>
            <dd>湖北方言社会实践</dd>
          </div>
          <div>
            <dt>制作</dt>
            <dd>社会实践团队</dd>
          </div>
          <div>
            <dt>主题</dt>
            <dd>方言 · 乡土 · 口述记忆</dd>
          </div>
        </dl>
        <p className="dialog-note">团队名称、成员、指导老师和联系方式可在此处替换。</p>
      </dialog>
    </>
  );
}
