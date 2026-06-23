
export default function Home() {

  const cards = [
    { id: 1, title: 'Trading', content: "" , url: '/trading'},
    { id: 2, title: 'Youtube', content: "" , url: '/youtube'},
    { id: 3, title: 'Blog', content: "" , url: '/blog'},
  ];

  return (
    <>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {cards.map((card) => (
            <a
              key={card.id}
              href={card.url}
              className="block bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p>{card.content}</p>
            </a>
        ))}
      </div>
    </>
  );
}
