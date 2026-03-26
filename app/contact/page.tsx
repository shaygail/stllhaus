"use client";

import { useState } from "react";

export default function ContactPage() {

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send message.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-stll-charcoal uppercase tracking-tight mb-6 text-center">
          Get in touch
        </h1>
        <p className="text-stll-muted text-center mb-8 text-sm">
          Please fill out the form below and we’ll get back to you as soon as possible.
        </p>
        {submitted ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-stll-charcoal mb-4">Thank you!</h2>
            <p className="text-stll-muted">Your message has been received. We’ll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-stll-muted mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border-b border-stll-charcoal/20 bg-transparent py-3 text-sm text-stll-charcoal placeholder:text-stll-muted/40 focus:outline-none focus:border-stll-charcoal transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-stll-muted mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border-b border-stll-charcoal/20 bg-transparent py-3 text-sm text-stll-charcoal placeholder:text-stll-muted/40 focus:outline-none focus:border-stll-charcoal transition-colors"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-stll-muted mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border-b border-stll-charcoal/20 bg-transparent py-3 text-sm text-stll-charcoal placeholder:text-stll-muted/40 focus:outline-none focus:border-stll-charcoal transition-colors"
                placeholder="How can we help you?"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stll-charcoal text-white py-3 rounded-none text-xs tracking-[0.2em] uppercase mt-6 hover:bg-stll-charcoal/80 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
