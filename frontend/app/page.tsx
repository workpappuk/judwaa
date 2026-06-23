
export default function Home() {

  const cards = [
    { id: 1, title: 'Trading', content: "" , url: '/trading'},
    { id: 2, title: 'Youtube', content: "" , url: '/youtube'},
    { id: 3, title: 'Blog', content: "" , url: '/blog'},
  ];

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-[#f5f7fb] dark:bg-[#0b0f15] text-zinc-900 dark:text-zinc-100 transition-colors rounded-xl p-3">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {cards.map((card) => (
            <a
              key={card.id}
              href={card.url}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded shadow-sm hover:shadow-md transition"
            >
              <h2 className="display-face text-xl font-semibold">{card.title}</h2>
              <p>{card.content}</p>
            </a>
        ))}
      </div>
    </main>
  );
}
