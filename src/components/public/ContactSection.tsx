import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { showError, showSuccess } from '@/utils/toast';
import { Loader2, Send, Github, Linkedin, Instagram, Mail, Link } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface PublicContext {
  publicUserId: string | undefined;
  publicProfile: any;
  avatarUrl: string | null;
  socialLinks: any[]; // Social links are now passed via context from PublicLayout
}

const getIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'github': return Github;
    case 'linkedin': return Linkedin;
    case 'instagram': return Instagram;
    case 'twitter': return Link; // Use generic link if not specific icon
    case 'facebook': return Link;
    case 'youtube': return Link;
    case 'tiktok': return Link;
    default: return Link;
  }
};

const ContactSection = () => {
  // Retrieve socialLinks from the context provided by PublicLayout
  const { socialLinks } = useOutletContext<PublicContext>();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    const { error } = await supabase.from('messages').insert(data);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Message sent successfully! I will get back to you soon.');
      form.reset();
    }
  };

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Hubungi Saya</h2>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Social Media Links */}
        <Card className="shadow-xl p-6 flex flex-col justify-between">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl text-gray-800">Media Sosial</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {socialLinks && socialLinks.length > 0 ? (
              socialLinks.map(link => {
                const Icon = getIcon(link.platform);
                return (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <Icon className="h-6 w-6 mr-4 text-blue-600" />
                    <span className="font-medium text-gray-700">{link.platform}</span>
                    <span className="ml-auto text-sm text-gray-500 truncate max-w-[50%]">{link.url}</span>
                  </a>
                );
              })
            ) : (
              <p className="text-gray-500">No social media links available.</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-2xl border-t-4 border-blue-600">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Kirim Pesan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Lengkap Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pesan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tulis pesan Anda di sini..." rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Kirim Pesan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;