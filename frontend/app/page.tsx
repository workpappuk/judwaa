
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiArrowUpRight, FiBookOpen, FiPlayCircle, FiTrendingUp } from "react-icons/fi";

export default function Home() {
  type Card = {
    id: number;
    title: string;
    content: string;
    url: string;
    icon: IconType;
  };

  const cards: Card[] = [
    { id: 1, title: "Trading", content: "Live market dashboard", url: "/trading", icon: FiTrendingUp },
    { id: 2, title: "Youtube", content: "Video ideas and publishing", url: "/youtube", icon: FiPlayCircle },
    { id: 3, title: "Blog", content: "Research notes and writeups", url: "/blog", icon: FiBookOpen },
  ];

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-[#f5f7fb] dark:bg-[#0b0f15] text-zinc-900 dark:text-zinc-100 transition-colors rounded-xl p-3">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.url}
            className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                <card.icon className="h-4 w-4" />
              </div>
              <FiArrowUpRight className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <h2 className="display-face text-xl font-semibold mt-3">{card.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{card.content}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
