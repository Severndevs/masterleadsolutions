# Master Lead Solutions — Website

Static HTML/PHP website for [masterleadsolutions.com](https://masterleadsolutions.com), hosted on Namecheap shared hosting.

## Project Structure

```
/                          ← Server home directory (NOT web root)
├── config.php             ← Private config — created manually, never committed
├── config.example.php     ← Template for config.php
└── public_html/           ← Web root (only this folder is public)
    ├── index.html
    ├── submit.php         ← AJAX form handler
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

## Namecheap Deployment (GitHub Integration)

1. Push this repo to GitHub (already done).
2. In Namecheap cPanel → **Git Version Control** → Connect Repository.
3. Set the **deploy path** to `public_html/` and the **branch** to `main`.
4. After each git push, trigger a pull in cPanel (or set up a webhook).

### One-time Server Setup

SSH into your Namecheap account and create `config.php` in your home directory (one level above `public_html`):

```bash
cp ~/config.example.php ~/config.php
nano ~/config.php   # fill in your email addresses
```

> `config.php` is gitignored and must exist on the server for form submissions to work.

## Form Submissions

The contact form POSTs to `submit.php` via AJAX.  
`submit.php` reads `~/config.php` (parent of `public_html`) and sends an email via PHP `mail()`.

**To test locally:** spin up PHP's built-in server from `public_html/`:
```bash
php -S localhost:8000
```

## Updating Content

All site content is in `public_html/index.html`.  
Styles live in `public_html/css/style.css`.
