import Image from "next/image";
import Link from "next/link";

import { Glyph, HoshiCluster, StoneTile, TILE_PATTERNS } from "@/components/public/glyph";
import { apiGet, resolveImageUrl } from "@/lib/api";
import type { Teacher } from "@/lib/types";

export const metadata = {
  title: "師資",
};

async function getTeachers(): Promise<Teacher[]> {
  try {
    return await apiGet<Teacher[]>("/api/v1/teachers");
  } catch {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  if (teachers.length === 0) {
    return (
      <section className="container-page py-16">
        <p className="text-ink-soft">尚未設定師資資料。</p>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blob h-72 w-72 bg-mint-200 left-[-4rem] top-[-4rem]" />
        <div className="blob h-80 w-80 bg-sun-200 right-[-6rem] top-12" />

        <div className="container-page relative py-14 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint-200 px-4 py-1.5 text-sm font-bold tracking-wider text-mint-700 shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-mint-700" />
            TEACHERS
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
            認識你的<br />
            <span className="relative inline-block">
              <span className="absolute -inset-x-2 inset-y-1 -z-10 -rotate-2 rounded-2xl bg-sun-300" />
              圍棋老師
            </span>
          </h1>
        </div>
      </section>

      {/* 每位老師一個區塊 */}
      <section className="container-page space-y-16 pb-16">
        {teachers.map((t, idx) => (
          <TeacherProfile key={t.id} teacher={t} reverse={idx % 2 === 1} />
        ))}
      </section>

      {/* CTA */}
      <section className="container-page py-8">
        <div className="rounded-[2.5rem] bg-ink p-8 text-center text-cream-100 md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            想跟老師見面聊聊嗎？
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream-100/70">
            免費試聽課 60 分鐘，老師會親自帶你看看孩子適合哪一班。
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-7 py-3 font-display font-bold text-white shadow-pop-coral hover:-rotate-1 hover:bg-coral-400 active:translate-y-1"
          >
            預約試聽
            <Glyph name="arrow" />
          </Link>
        </div>
      </section>

      <div className="h-32" />
    </>
  );
}

function TeacherProfile({ teacher, reverse }: { teacher: Teacher; reverse: boolean }) {
  const ex = teacher.extras ?? {};
  const avatar = resolveImageUrl(teacher.avatar_url);

  return (
    <article className="grid gap-8 md:grid-cols-12 md:gap-10">
      {/* 左：人像 + 基本資料 */}
      <div className={`md:col-span-5 ${reverse ? "md:order-2" : ""}`}>
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-sun-300 via-coral-200 to-mint-300 p-2 shadow-pop-lg">
            <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-cream-100">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={teacher.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 28rem"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-ink-soft">
                  <div className="text-center">
                    <span className="grid h-24 w-24 mx-auto place-items-center rounded-2xl bg-ink shadow-pop-sm">
                      <span className="h-12 w-12 rounded-full border-4 border-cream-100 bg-cream-100" />
                    </span>
                    <p className="mt-3 font-display text-2xl font-bold text-ink">
                      {teacher.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 浮動段位章 */}
          {teacher.rank && (
            <span className="absolute -right-3 -top-3 grid h-20 w-20 -rotate-12 place-items-center rounded-2xl bg-sun-400 text-center font-display text-sm font-bold text-ink shadow-pop">
              {teacher.rank.split("·")[0].trim()}
            </span>
          )}
          <span className="absolute -left-3 bottom-12 grid h-14 w-14 rotate-6 place-items-center rounded-2xl bg-mint-300 shadow-pop">
            <StoneTile pattern={TILE_PATTERNS.hoshi} />
          </span>
        </div>

        {/* 教育 + 排名 + 聯絡 */}
        <ul className="mt-6 space-y-2 text-sm">
          {ex.taiwan_amateur_ranking && (
            <li className="flex items-center gap-2 rounded-xl bg-coral-100 px-3 py-2 font-bold text-coral-800">
              <HoshiCluster className="h-4 w-4" />
              台灣業餘排名 第 {ex.taiwan_amateur_ranking} 名
            </li>
          )}
          {ex.online_rank && (
            <li className="flex items-center gap-2 rounded-xl bg-mint-100 px-3 py-2 font-bold text-mint-800">
              <span className="h-2 w-2 rounded-full bg-mint-700" />
              {ex.online_rank}
            </li>
          )}
          {ex.education?.university && (
            <li className="rounded-xl bg-cream-100 px-3 py-2 text-ink-soft">
              <span className="font-bold text-ink">學歷：</span>
              {ex.education.university}
              {ex.education.department ? ` · ${ex.education.department}` : ""}
            </li>
          )}
          {ex.contact?.facebook && (
            <li className="rounded-xl bg-cream-100 px-3 py-2 text-ink-soft">
              <span className="font-bold text-ink">Facebook：</span>
              {ex.contact.facebook}
            </li>
          )}
        </ul>
      </div>

      {/* 右：詳細介紹 */}
      <div className={`md:col-span-7 ${reverse ? "md:order-1" : ""}`}>
        <p className="font-display text-sm font-bold tracking-wider text-mint-700">
          {teacher.title ?? "主教練"}
        </p>
        <h2 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
          {teacher.name}
        </h2>
        {teacher.rank && (
          <p className="mt-2 font-display text-base font-bold text-coral-700">
            {teacher.rank}
          </p>
        )}

        {teacher.bio && (
          <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-soft">
            {teacher.bio}
          </p>
        )}

        {/* 教學理念 */}
        {Array.isArray(ex.teaching_philosophy) && ex.teaching_philosophy.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">教學理念</h3>
            <ol className="mt-4 space-y-3">
              {ex.teaching_philosophy.map((p, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-sun-100 p-4">
                  <span className="grid h-8 w-8 shrink-0 -rotate-6 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-cream-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed text-ink">{p}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 教學經歷 */}
        {Array.isArray(ex.teaching_experience) && ex.teaching_experience.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">教學經歷</h3>
            <ul className="mt-4 space-y-2">
              {ex.teaching_experience.map((e, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border-2 border-cream-200 bg-white px-4 py-2.5"
                >
                  <span className="rounded-md bg-mint-100 px-2 py-0.5 font-mono text-xs text-mint-800">
                    {e.year}
                  </span>
                  <span className="font-bold text-ink">{e.organization}</span>
                  {e.role && <span className="text-sm text-ink-soft">{e.role}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 比賽戰績 */}
        {Array.isArray(ex.competition_awards) && ex.competition_awards.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">比賽戰績</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ex.competition_awards.map((y, i) => {
                const tones = ["bg-coral-100", "bg-sun-100", "bg-mint-100", "bg-sky2-100"];
                return (
                  <div key={i} className={`rounded-2xl ${tones[i % tones.length]} p-4`}>
                    <p className="font-display text-2xl font-bold text-ink">
                      {y.year}
                    </p>
                    {y.note && (
                      <p className="text-xs text-ink-soft">{y.note}</p>
                    )}
                    <ul className="mt-2 space-y-1 text-sm">
                      {y.awards.map((a, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
                          <span className="text-ink">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 其他經歷 */}
        {Array.isArray(ex.other_experience) && ex.other_experience.length > 0 && (
          <section className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">其他經歷</h3>
            <ul className="mt-4 space-y-1.5 text-sm">
              {ex.other_experience.map((e, i) => (
                <li key={i} className="flex items-baseline gap-2 text-ink-soft">
                  <span className="font-mono text-xs text-ink-soft">{e.year}</span>
                  <span className="font-bold text-ink">{e.event}</span>
                  {e.role && <span>· {e.role}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 既有的 achievements 條列（如果 extras 沒填，用這個當 fallback） */}
        {teacher.achievements.length > 0 && !ex.competition_awards && (
          <section className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">主要成績</h3>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
              {teacher.achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
