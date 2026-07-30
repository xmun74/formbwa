"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { tv } from "../lib/tv";

/**
 * Tabs 합성 — **상호작용 합성**(활성 탭 상태를 Context로 공유) → `"use client"`.
 * Context는 클라이언트 전용 → **닷 노테이션**(`<Tabs><Tabs.Trigger/><Tabs.Content/>`).
 * **클라이언트 트리 안에서만** 소비할 것.
 *
 * ARIA tabs 패턴: role=tablist/tab/tabpanel · aria-selected/controls/labelledby ·
 * **roving tabindex + 화살표/Home/End 키 이동**(활성화가 포커스를 따라감).
 */
interface TabsCtx {
  value: string | undefined;
  setValue: (v: string) => void;
  baseId: string;
}
const Ctx = createContext<TabsCtx | null>(null);
function useTabsCtx(): TabsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tabs.* 는 <Tabs> 안에서만 쓸 수 있어요");
  return ctx;
}

const triggerId = (base: string, v: string) => `${base}-t-${v}`;
const contentId = (base: string, v: string) => `${base}-c-${v}`;

const tabs = tv({
  slots: {
    list: "border-line flex gap-1 border-b",
    trigger:
      "text-ink-muted hover:text-ink aria-selected:border-brand-500 aria-selected:text-ink -mb-px cursor-pointer border-b-2 border-transparent px-4 py-2 text-base font-bold transition-colors",
    content: "pt-4",
  },
});

function TabsRoot({
  defaultValue,
  value: valueProp,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const baseId = useId();
  const setValue = (v: string) => {
    if (valueProp === undefined) setUncontrolled(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TabsList({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="tablist"
        className={tabs().list({ className })}
        {...props}
      />
    );
  },
);

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ value, className, onClick, ...props }, ref) {
    const { value: active, setValue, baseId } = useTabsCtx();
    const selected = active === value;

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      const list = e.currentTarget.parentElement;
      if (!list) return;
      const items = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
      );
      const i = items.indexOf(e.currentTarget);
      let next = -1;
      if (e.key === "ArrowRight") next = (i + 1) % items.length;
      else if (e.key === "ArrowLeft")
        next = (i - 1 + items.length) % items.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      if (next >= 0) {
        e.preventDefault();
        items[next]?.focus();
        items[next]?.click(); // 활성화가 포커스를 따라감
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={triggerId(baseId, value)}
        aria-selected={selected}
        aria-controls={contentId(baseId, value)}
        tabIndex={selected ? 0 : -1}
        className={tabs().trigger({ className })}
        onClick={(e) => {
          onClick?.(e);
          setValue(value);
        }}
        onKeyDown={onKeyDown}
        {...props}
      />
    );
  },
);

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}
const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value, className, ...props }, ref) {
    const { value: active, baseId } = useTabsCtx();
    if (active !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={contentId(baseId, value)}
        aria-labelledby={triggerId(baseId, value)}
        tabIndex={0}
        className={tabs().content({ className })}
        {...props}
      />
    );
  },
);

/** 상호작용 합성 → 닷 노테이션. 클라이언트 트리에서만 소비. */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
