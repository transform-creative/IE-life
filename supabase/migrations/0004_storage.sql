-- Storage ---------------------------------------------------------------------
-- A public bucket for the hero photography. Images are referenced by a local
-- array of public URLs in app/presentation/shopping/ShoppingImages.ts — upload
-- here, then paste the public URL into that array.
--
-- Public read is intentional: these are decorative wedding/lifestyle photos, and
-- a public bucket means <img src> works with no signed-URL round trip.

insert into storage.buckets (id, name, public)
values ('shopping_images', 'shopping_images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "shopping_images_public_read" on storage.objects;
create policy "shopping_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'shopping_images');

drop policy if exists "shopping_images_auth_insert" on storage.objects;
create policy "shopping_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'shopping_images');

drop policy if exists "shopping_images_auth_update" on storage.objects;
create policy "shopping_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'shopping_images')
  with check (bucket_id = 'shopping_images');

drop policy if exists "shopping_images_auth_delete" on storage.objects;
create policy "shopping_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'shopping_images');
