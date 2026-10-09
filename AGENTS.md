<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Project data (projects, project_timeline) is read/written from the browser Supabase client; RLS on user_id is the isolation boundary, so every new project table must carry user_id with owner-only policies.
- Projects are soft-deleted via is_deleted; list/get queries must filter is_deleted=false.
