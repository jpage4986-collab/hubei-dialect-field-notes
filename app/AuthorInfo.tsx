"use client";

import { useEffect, useRef, useState } from "react";

export default function AuthorInfo() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setClosing(false);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimerRef.current = setTimeout(() => setOpen(false), 420);
  };

  return (
    <>
      <button className="author-trigger" type="button" onClick={() => setOpen(true)}>
        团队介绍
      </button>
      <dialog
        className={`author-dialog ${closing ? "is-closing" : ""}`}
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) requestClose();
        }}
      >
        <div className="team-ambient" aria-hidden="true">
          <span>楚</span>
          <i />
          <i />
          <i />
        </div>
        <article className="team-panel floating-layer">
          <button className="dialog-close" type="button" onClick={requestClose} aria-label="关闭团队介绍">
            收起
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
        </article>
      </dialog>
    </>
  );
}
