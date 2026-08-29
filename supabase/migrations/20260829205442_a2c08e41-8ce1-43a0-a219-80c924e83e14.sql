CREATE TABLE public.brand_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interest text NOT NULL DEFAULT 'patrocinio',
  business_name text NOT NULL,
  business_type text,
  contact_name text NOT NULL,
  contact_role text,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  instagram text,
  facebook text,
  city text,
  address text,
  description text,
  goals text,
  budget_range text,
  referral_source text,
  privacy_accepted boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.brand_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.brand_leads TO authenticated;
GRANT ALL ON public.brand_leads TO service_role;

ALTER TABLE public.brand_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a brand lead"
  ON public.brand_leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(business_name) BETWEEN 2 AND 120
    AND char_length(contact_name) BETWEEN 2 AND 120
    AND char_length(email) <= 255 AND email LIKE '%@%'
    AND char_length(phone) BETWEEN 7 AND 30
    AND char_length(COALESCE(description, '')) <= 1500
    AND char_length(COALESCE(goals, '')) <= 1500
    AND status = 'new' AND admin_notes IS NULL
  );

CREATE POLICY "Admins can read brand leads"
  ON public.brand_leads FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update brand leads"
  ON public.brand_leads FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete brand leads"
  ON public.brand_leads FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER brand_leads_updated_at
  BEFORE UPDATE ON public.brand_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 2 AND 120
    AND char_length(email) <= 255 AND email LIKE '%@%'
    AND char_length(COALESCE(phone, '')) <= 30
    AND char_length(message) BETWEEN 5 AND 2000
    AND status = 'new' AND admin_notes IS NULL
  );

CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();