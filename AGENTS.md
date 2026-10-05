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

- Keep the storefront product and checkout as child routes of a ventilador Outlet layout, with address separate and shop data shared; this preserves direct checkout links and consistent totals.
- Treat checkout completion as a non-payment demonstration without sending collected address data to a server; no payment provider or backend is connected.
