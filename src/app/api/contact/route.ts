import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  await prisma.contactInquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      productName: data.productName,
      message: data.message,
    },
  });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Thilak Products <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL_TO!,
      subject: `New inquiry from ${data.name}${data.productName ? ` — ${data.productName}` : ""}`,
      replyTo: data.email,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone ?? "-"}`,
        `Product: ${data.productName ?? "-"}`,
        "",
        data.message,
      ].join("\n"),
    });
  } catch {
    // Email failed but inquiry is saved; still report success.
  }

  return NextResponse.json({ ok: true });
}
