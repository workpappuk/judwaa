import Link from "next/link";

const SCHOOL_ROUTE_CARDS = [
  {
    title: "Organization Management",
    description: "Create, update and activate/deactivate organizations.",
    href: "/lms/organization-management",
  },
  {
    title: "School Management",
    description: "Create, update and activate/deactivate schools.",
    href: "/lms/school-management",
  },
  {
    title: "Student Management",
    description: "Manage student lifecycle and enrollment records.",
    href: "/lms/student-management",
  },
  {
    title: "Exam Management",
    description: "Manage exams, schedules, and activation workflows.",
    href: "/lms/exam-management",
  },
];

export default function SchoolRoutesPage() {
  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">School Routes</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Choose a dedicated route to manage school onboarding workflows.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {SCHOOL_ROUTE_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
