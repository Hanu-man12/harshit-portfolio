'use server';

export async function submitContact(
  _prev: { success: boolean; message: string } | null,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { success: false, message: 'All fields are required.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: 'shawharshit116@gmail.com',
        subject: `Portfolio contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
    } catch {
      console.error('Resend error — logging submission instead');
      console.log({ name, email, message });
    }
  } else {
    console.log('Contact form submission:', { name, email, message });
  }

  return { success: true, message: 'Thanks! Your message has been received.' };
}
