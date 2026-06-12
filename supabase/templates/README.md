# Supabase email templates

Auth emails are built by **Supabase** and delivered through **Resend SMTP**. Resend dashboard templates are not used.

Deploy from this repo:

```bash
supabase config push
```

## Templates

| Supabase template | File                  | Subject                        |
| ----------------- | --------------------- | ------------------------------ |
| Reset password    | `reset-password.html` | Your LibreAuth reset code      |
| Confirm signup    | `confirm-signup.html` | Confirm your LibreAuth account |

Both use `{{ .Token }}` only (no `{{ .ConfirmationURL }}`) so users get a 6-digit code.

Manual paste: **Authentication → Email Templates** in the [Supabase dashboard](https://supabase.com/dashboard/project/libemzdyiiibkenxppdl/auth/templates).
