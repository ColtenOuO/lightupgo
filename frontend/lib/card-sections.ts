/**
 * 把後端 page/section 的內部 slug 對應到「老師看得懂」的友善標籤與顯示位置。
 *
 * 這份 mapping 同時被 /admin/cards 列表分組標題、新增表單的下拉選單使用。
 */

export type SectionMeta = {
  /** 老師看得懂的名稱 */
  label: string;
  /** 一句話描述：「這個區塊出現在前台哪裡 / 拿來顯示什麼」 */
  description: string;
};

export const PAGE_LABELS: Record<string, string> = {
  home: "首頁",
  for_kids: "給小朋友頁",
  for_parents: "給家長頁",
  register: "報名頁",
};

/**
 * key 是 `page::section`，value 是這個位置的友善資訊。
 */
export const SECTION_META: Record<string, SectionMeta> = {
  // 首頁
  "home::hero": {
    label: "Hero 主視覺",
    description: "首頁最上方的大標題與按鈕。",
  },
  "home::stats": {
    label: "數字統計",
    description: "首頁 Bento 顯示「100+ 位學員」等的數字 chip。",
  },
  "home::why_us": {
    label: "為什麼選我們",
    description: "首頁「為什麼選立光」四格簡介。",
  },
  "home::cta": {
    label: "底部 CTA",
    description: "首頁最下方的「目前招生中」黑底卡。",
  },

  // 給小朋友頁
  "for_kids::games": {
    label: "遊戲玩法",
    description: "給小朋友頁的 4 張遊戲卡。",
  },
  "for_kids::rewards": {
    label: "獎勵清單",
    description: "「在立光，你會拿到」4 格小獎勵。",
  },
  "for_kids::flow": {
    label: "上課流程",
    description: "「上課是這樣的」3 個步驟。",
  },

  // 給家長頁
  "for_parents::stats": {
    label: "Hero 旁數字",
    description: "給家長頁 Hero 右側的 4 個小卡（如 10+ 年經驗）。",
  },
  "for_parents::benefits": {
    label: "六大效益",
    description: "「圍棋會幫孩子長出什麼」六張卡。",
  },
  "for_parents::worries": {
    label: "家長的擔心",
    description: "「我有點擔心…」4 個 Q&A。",
  },
  "for_parents::faq": {
    label: "FAQ 完整問答",
    description: "頁面下半部的可摺疊 FAQ 清單。",
  },

  // 報名頁
  "register::forms": {
    label: "課程報名表單",
    description: "目前招生中的課程，每筆會出現一張「選擇課程」卡與 iframe。",
  },
  "register::steps": {
    label: "4 步驟流程",
    description: "報名頁上方「流程很簡單，4 步驟」。",
  },
  "register::trust": {
    label: "信任徽章",
    description: "Hero 下方那一排小白藥丸（如「招生中 / 不推銷」）。",
  },
  "register::quick_faq": {
    label: "報名前快速 FAQ",
    description: "報名頁右側欄的小 FAQ。",
  },
};

/** 給後台「新增卡片」按鈕用 — 預先列好可以選的所有位置。 */
export const KNOWN_LOCATIONS: { page: string; section: string }[] = Object.keys(
  SECTION_META,
).map((k) => {
  const [page, section] = k.split("::");
  return { page, section };
});

export function pageLabel(page: string): string {
  return PAGE_LABELS[page] ?? page;
}

export function sectionLabel(page: string, section: string): string {
  return SECTION_META[`${page}::${section}`]?.label ?? section;
}

export function sectionDescription(page: string, section: string): string {
  return SECTION_META[`${page}::${section}`]?.description ?? "";
}

export function locationLabel(page: string, section: string): string {
  return `${pageLabel(page)} · ${sectionLabel(page, section)}`;
}
