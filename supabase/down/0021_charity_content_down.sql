-- Down: 0021_charity_content. Drop the curated charity-content columns.
alter table public.charity
  drop column if exists cause,
  drop column if exists dgr_item,
  drop column if exists logo_url,
  drop column if exists hero_image_url,
  drop column if exists purpose,
  drop column if exists programmes,
  drop column if exists featured_quote,
  drop column if exists featured_quote_attribution,
  drop column if exists stories,
  drop column if exists content_updated_at;
