"use client";

import { useState } from "react";

type ContactFormProps = {
  defaultProduct?: string;
};

type FieldErrors = Record<string, string[]>;

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm({ defaultProduct }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      productName: String(formData.get("productName") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (res.status === 400) {
        const data = await res.json().catch(() => null);
        setFieldErrors(data?.issues?.fieldErrors ?? {});
        setStatus("error");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 rounded-lg border border-gold/30 bg-surface-2 p-8 text-center">
        <div className="text-3xl">🪔</div>
        <p className="mt-4 font-display text-xl text-cream">
          Thank you — we&apos;ve received your message and will reply soon.
        </p>
      </div>
    );
  }

  const labelClass = "block text-sm font-medium text-cream";
  const inputClass =
    "mt-1 w-full rounded-lg border border-gold/15 bg-surface-2 px-4 py-2.5 text-cream placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
  const errorClass = "mt-1 text-sm text-red-400";

  function errorFor(field: string) {
    const messages = fieldErrors[field];
    if (!messages || messages.length === 0) return null;
    return <p className={errorClass}>{messages[0]}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          className={inputClass}
        />
        {errorFor("name")}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        {errorFor("email")}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="text-muted">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+94 ..."
          className={inputClass}
        />
        {errorFor("phone")}
      </div>

      <div>
        <label htmlFor="productName" className={labelClass}>
          Product <span className="text-muted">(optional)</span>
        </label>
        <input
          id="productName"
          name="productName"
          type="text"
          defaultValue={defaultProduct ?? ""}
          placeholder="Which product are you interested in?"
          className={inputClass}
        />
        {errorFor("productName")}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="How can we help you?"
          className={inputClass}
        />
        {errorFor("message")}
      </div>

      {status === "error" && Object.keys(fieldErrors).length === 0 && (
        <p className={errorClass}>
          Something went wrong. Please try WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:brightness-100"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
