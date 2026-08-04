ExpoLead OS brand assets
========================

Drop the official logo files here. This is the single source of truth
for the logo across the whole product, so nothing gets missed.

The new logo is text only (no four-box mark).

Files to keep in this folder:

  logo-light.svg   Light/white text, for dark backgrounds (the top header).
  logo-dark.svg    Dark text, for light backgrounds (footers, legal pages).
  logo-email.png   PNG, about 400px wide, for emails and link previews
                   (email clients and social crawlers cannot render SVG).

If only one master file exists, an SVG is best. Claude can generate the
light, dark and PNG variants from it, given the two text colours.

When the logo is swapped into the app, the ~16 hand-coded inline copies
across the site (landing, login, about, features, pricing, privacy,
terms, resources, trade-shows, Sidebar, MobileNav, the favicon at
app/icon.svg, app/opengraph-image.tsx, the email-logo route and
public/email-logo.png) get consolidated to reference these files, so
future logo changes are a one-place edit.
