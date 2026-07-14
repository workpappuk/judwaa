import Link from "next/link";
import { FiBookOpen, FiClipboard, FiMap, FiUserCheck, FiUsers } from "react-icons/fi";

const LMS_CARDS = [
  {
    title: "Organization Management",
    description: "Dedicated route to manage organization CRUD.",
    href: "/lms/organization-management",
    icon: FiUsers,
  },
  {
    title: "School Management",
    description: "Dedicated route to manage school CRUD.",
    href: "/lms/school-management",
    icon: FiBookOpen,
  },
  {
    title: "School Routes",
    description: "Route map for school onboarding and management flows.",
    href: "/lms/school-routes",
    icon: FiMap,
  },
  {
    title: "Student Management",
    description: "Dedicated route to manage student workflows.",
    href: "/lms/student-management",
    icon: FiUserCheck,
  },
  {
    title: "Exam Management",
    description: "Dedicated route to manage exam workflows.",
    href: "/lms/exam-management",
    icon: FiClipboard,
  },
];

export default function LmsPage() {
  return (
    <main className="min-h-[calc(100vh-7rem)] rounded-xl bg-[#f8fafc] p-4 text-zinc-900 dark:bg-[#0b0f15] dark:text-zinc-100">
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="display-face text-2xl font-semibold">LMS Route Hub</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Navigate to dedicated management routes for organization, school, student, and exam workflows.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LMS_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <card.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-lg font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{card.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
