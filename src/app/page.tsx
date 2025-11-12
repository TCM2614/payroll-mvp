import Link from "next/link";
import Image from "next/image";



export default function Home() {

  return (

    <main className="flex min-h-screen items-center justify-center px-6">

      <div className="text-center max-w-2xl">

        <div className="mb-6 flex justify-center">

          <Image

            src="/logo.svg"

            alt="Payroll Calculator Logo"

            width={80}

            height={80}

            className="dark:invert"

          />

        </div>

        <h1 className="mb-4 text-4xl font-bold">UK Payroll Take-Home Calculator</h1>

        <p className="mb-8 text-zinc-600 dark:text-zinc-400">

          Compare PAYE, Umbrella & Limited company take-home pay.

        </p>

        <Link

          href="/calc"

          className="rounded-xl bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"

        >

          Launch Calculator

        </Link>

      </div>

    </main>

  );

}
