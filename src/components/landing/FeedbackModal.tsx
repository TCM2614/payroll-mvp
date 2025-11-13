"use client";



import { FormEvent, useState } from "react";



interface FeedbackModalProps {

  isOpen: boolean;

  onClose: () => void;

}



export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {

  const [formState, setFormState] = useState({

    name: "",

    email: "",

    feedback: "",

  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(

    "idle",

  );



  if (!isOpen) return null;



  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();

    setStatus("submitting");



    // 🔁 Dummy handler – connect to your backend later

    setTimeout(() => {

      console.log("Feedback submitted:", formState);

      setStatus("success");

      setTimeout(() => {

        setStatus("idle");

        setFormState({ name: "", email: "", feedback: "" });

        onClose();

      }, 900);

    }, 800);

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-6 text-white shadow-2xl">

        <div className="flex items-center justify-between">

          <h2 className="text-base font-semibold tracking-tight">

            Help Us Improve

          </h2>

          <button

            onClick={onClose}

            className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"

            type="button"

          >

            ✕

          </button>

        </div>

        <p className="mt-1 text-xs text-white/60">

          Tell us what you&apos;d like to see next — PAYE tweaks, Umbrella

          breakdowns, Limited company features, SIPP, student loans, multi-job

          logic and more.

        </p>



        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>

          <div>

            <label className="text-xs text-white/60" htmlFor="fb-name">

              Name (optional)

            </label>

            <input

              id="fb-name"

              type="text"

              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"

              value={formState.name}

              onChange={(e) =>

                setFormState((prev) => ({ ...prev, name: e.target.value }))

              }

            />

          </div>



          <div>

            <label className="text-xs text-white/60" htmlFor="fb-email">

              Email (optional)

            </label>

            <input

              id="fb-email"

              type="email"

              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"

              value={formState.email}

              onChange={(e) =>

                setFormState((prev) => ({ ...prev, email: e.target.value }))

              }

            />

          </div>



          <div>

            <label className="text-xs text-white/60" htmlFor="fb-feedback">

              Feedback

            </label>

            <textarea

              id="fb-feedback"

              rows={4}

              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"

              placeholder="What should we improve or add?"

              value={formState.feedback}

              onChange={(e) =>

                setFormState((prev) => ({ ...prev, feedback: e.target.value }))

              }

              required

            />

          </div>



          <button

            type="submit"

            disabled={status === "submitting" || status === "success"}

            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/70"

          >

            {status === "submitting" ? "Sending…" : "Submit Feedback"}

          </button>



          {status === "success" && (

            <p className="text-xs font-medium text-emerald-400">

              Thanks for your feedback!

            </p>

          )}

        </form>

      </div>

    </div>

  );

}

