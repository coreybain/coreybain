import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-col p-8 sm:p-20 gap-4 h-[calc(100vh_-_80px)] items-center overflow-auto">
        <p className="mb-8 max-w-xl text-center text-xl">
          Hey! I’m Corey — a Next.js Full Stack Engineer exploring iOS
          development. Your probably here for one of these...
        </p>

        <div className="mx-auto flex w-full max-w-md flex-grow flex-col items-center space-y-6">
          <Link
            href="https://quote.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-black/60 py-3 text-center transition-all duration-300 hover:bg-black/60 hover:text-white"
          >
            <span className="text-lg">QuoteCloud</span>
            <span className="block text-sm text-gray-500 transition-all group-hover:text-gray-200">
              the best way to create sales quotes & proposals with ease.
            </span>
          </Link>
          <Link
            href="https://www.youtube.com/@quotecloud"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-black/60 py-3 text-center transition-all duration-300 hover:bg-black/60 hover:text-white"
          >
            <span className="text-lg">Youtube</span>
            <span className="block text-sm text-gray-500 transition-all group-hover:text-gray-200">
              videos about software dev stuff and work
            </span>
          </Link>
          <Link
            href="https://create.t3.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full border border-black/60 py-3 text-center transition-all duration-300 hover:bg-black/60 hover:text-white"
          >
            <span className="text-lg">Create t3 app</span>
            <span className="block text-sm text-gray-500 transition-all group-hover:text-gray-200">
              The start to all my projects (shoutout to theo & the t3 team)
            </span>
          </Link>
          {/* <Link
            href="/blog"
            className="group relative w-full border border-black/60 py-3 text-center transition-all duration-300 hover:bg-black/60 hover:text-white"
          >
            <span className="text-lg">Blog</span>
            <span className="block text-sm text-gray-500 transition-all group-hover:text-gray-200">
              random thoughts about things
            </span>
          </Link> */}
        </div>
      </main>
      <footer className="flex w-full gap-6 border-t border-gray-100 h-20 flex-wrap items-center justify-center">
        <Link href="https://github.com/coreybain" target="_blank">
          GitHub
        </Link>
        <Link href="https://www.linkedin.com/in/coreybaines/" target="_blank">
          LinkedIn
        </Link>
        <Link href="https://www.x.com/coreybaines" target="_blank">
          X (Twitter)
        </Link>
      </footer>
    </div>
  );
}
