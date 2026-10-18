# fullrota.com holding site

Static website for FullRota, a service from Kinetic Flow Limited (company number 17526373).
No build step: the files in this folder are the site.

| File | What it is |
| --- | --- |
| `index.html` | Home page |
| `privacy.html` | Privacy policy, including cookies (`privacy.html#cookies`) |
| `terms.html` | Terms page (agency terms are sent on request) |
| `contact.html` | Contact details and company information |
| `404.html` | Page shown for missing pages |
| `favicon.svg`, `robots.txt` | Browser icon and search-engine file |
| `assets/` | Shared styles for the inner pages, and the WhatsApp screenshot |

## Publish on DigitalOcean App Platform

1. Put this folder in its own GitHub repository (for example `fullrota-site`), with these files at the top level.
2. In DigitalOcean, go to **Create → App Platform**, choose **GitHub**, and pick the repository and the `main` branch. Leave **Autodeploy** on, so each change to the repository goes live automatically.
3. DigitalOcean should detect a **Static Site**. If it asks:
   - Build command: leave empty
   - Output directory: `/` (the top of the repository)
   - Error document: `404.html`
4. Create the app. It gets a temporary `…ondigitalocean.app` address; check the site there first.
5. In the app's **Settings → Domains**, add `fullrota.com` and `www.fullrota.com`. DigitalOcean shows the DNS records to add.
   - **Keeping DNS with your registrar** (simplest if your email records are there): add the records DigitalOcean shows. Leave the email (MX, SPF, DKIM) records alone.
   - **Moving DNS to DigitalOcean**: copy every existing record across first, including all the email ones, before changing the nameservers, or email will stop.
6. DigitalOcean issues the HTTPS certificate automatically once the DNS records are found. This can take from a few minutes to a few hours.

## Before going live

- Check `hello@fullrota.com` receives email; it is used on every page.
- Have the privacy policy reviewed, and add the ICO registration number once Kinetic Flow is registered.
- Use `https://fullrota.com/privacy.html` as the privacy policy URL in the Meta app settings.
