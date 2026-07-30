"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { tv } from "../lib/tv";

/**
 * Dialog 합성 — **상호작용 합성**이라 Context로 상태를 공유한다 → `"use client"`.
 * Context가 클라이언트 전용이므로 RSC 이점이 없는 컴포넌트 → **닷 노테이션**으로 제공
 * (`<Dialog><Dialog.Content/></Dialog>`). 반드시 **클라이언트 트리 안에서** 소비할 것.
 *
 * 접근성은 **네이티브 `<dialog>`** 로 확보: `showModal()`이 포커스 트랩·ESC 닫기·
 * top-layer·배경 inert·닫힐 때 포커스 복원을 브라우저 표준으로 제공한다. (직접 구현 대신 플랫폼)
 */
interface DialogCtx {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descId: string;
}
const Ctx = createContext<DialogCtx | null>(null);

function useDialogCtx(): DialogCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Dialog.* 는 <Dialog> 안에서만 쓸 수 있어요");
  return ctx;
}

const dialog = tv({
  slots: {
    content:
      "border-line bg-surface text-ink m-auto w-full max-w-sm rounded-2xl border p-6 backdrop:bg-black/55",
    title: "text-lg font-bold",
    description: "text-ink-soft mt-2 text-base leading-relaxed",
    footer: "mt-6 flex gap-3",
  },
});

function DialogRoot({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const descId = useId();
  return (
    <Ctx.Provider value={{ open, onOpenChange, titleId, descId }}>
      {children}
    </Ctx.Provider>
  );
}

const DialogTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogTrigger({ onClick, ...props }, ref) {
  const { onOpenChange } = useDialogCtx();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(true);
      }}
      {...props}
    />
  );
});

/**
 * 모달 본체 — 네이티브 `<dialog>`. open을 showModal()/close()에 동기화.
 * (dialog 요소 ref를 자체 소유하므로 forwardRef 대신 내부 ref를 쓴다.)
 */
function DialogContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDialogElement>) {
  const { open, onOpenChange, titleId, descId } = useDialogCtx();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={dialog().content({ className })}
      onClose={() => onOpenChange(false)} // ESC·close() → 상태 동기화
      {...props}
    >
      {children}
    </dialog>
  );
}

const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(function DialogTitle({ className, ...props }, ref) {
  const { titleId } = useDialogCtx();
  return (
    <h2
      ref={ref}
      id={titleId}
      className={dialog().title({ className })}
      {...props}
    />
  );
});

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, ...props }, ref) {
  const { descId } = useDialogCtx();
  return (
    <p
      ref={ref}
      id={descId}
      className={dialog().description({ className })}
      {...props}
    />
  );
});

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div ref={ref} className={dialog().footer({ className })} {...props} />
    );
  },
);

const DialogClose = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose({ onClick, ...props }, ref) {
  const { onOpenChange } = useDialogCtx();
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
});

/** 상호작용 합성 → 닷 노테이션(Object.assign). 클라이언트 트리에서만 소비. */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
});
