# Auth e-mailtemplates (fallback zonder Send Email-hook)

Gebruik deze templates enkel als je **niet** de Send Email-hook (`/api/hooks/auth-email`) gebruikt maar
Supabase zelf laat mailen via Custom SMTP (Resend). Plak de inhoud in Supabase → Authentication → Email
Templates. Variabelen: `{{ .ConfirmationURL }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .Email }}`.

De links wijzen naar `/auth/confirm` van de app zodat de flow identiek is aan de hook-variant.
