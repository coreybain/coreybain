import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-col p-8 sm:p-20 gap-4 h-[calc(100vh_-_80px)] items-center overflow-auto">
        <p className="mb-8 max-w-xl text-center text-xl text-gray-800 dark:text-gray-200">
          Hey! I&apos;m Corey — a Next.js Full Stack Engineer exploring iOS
          development. Your probably here for one of these...
        </p>

        <div className="mx-auto flex w-full max-w-md flex-grow flex-col items-center space-y-6">
          <Link
            href="https://quote.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 text-center transition-all duration-300 hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white rounded-md shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-white">
              QuoteCloud
            </span>
            <span className="block px-2 text-sm text-gray-600 dark:text-gray-400 transition-all group-hover:text-gray-200">
              the best way to create sales quotes & proposals with ease.
            </span>
          </Link>
          <Link
            href="https://apps.apple.com/us/app/traveldocs/id6477499212"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 text-center transition-all duration-300 hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white rounded-md shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-white">
              TravelDocs
            </span>
            <span className="block px-2 text-sm text-gray-600 dark:text-gray-400 transition-all group-hover:text-gray-200">
              Smart itinerary manager with real-time updates and offline
              document storage
            </span>
          </Link>
          <Link
            href="https://www.youtube.com/@quotecloud"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 text-center transition-all duration-300 hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white rounded-md shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-white">
              Youtube
            </span>
            <span className="block px-2 text-sm text-gray-600 dark:text-gray-400 transition-all group-hover:text-gray-200">
              videos about software dev stuff and work
            </span>
          </Link>
          <Link
            href="https://create.t3.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 text-center transition-all duration-300 hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white rounded-md shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-white">
              Create t3 app
            </span>
            <span className="block px-2 text-sm text-gray-600 dark:text-gray-400 transition-all group-hover:text-gray-200">
              the start to all my projects (shoutout to theo & the t3 team)
            </span>
          </Link>
          {/* <Link
            href="/blog"
            className="group relative w-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 text-center transition-all duration-300 hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white rounded-lg shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-gray-900 dark:text-gray-100 group-hover:text-white">Blog</span>
            <span className="block text-sm text-gray-600 dark:text-gray-400 transition-all group-hover:text-gray-200">
              random thoughts about things
            </span>
          </Link> */}
        </div>
      </main>
      <footer className="flex w-full gap-6 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm h-20 flex-wrap items-center justify-center">
        <Link
          href="https://github.com/coreybain"
          target="_blank"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          GitHub
        </Link>
        <Link
          href="https://www.linkedin.com/in/coreybaines/"
          target="_blank"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          LinkedIn
        </Link>
        <Link
          href="https://www.x.com/coreybaines"
          target="_blank"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          X (Twitter)
        </Link>
      </footer>
    </div>
  );
}
