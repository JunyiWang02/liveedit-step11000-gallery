# LiveEdit — step 11000 qualitative gallery

Self-contained static gallery of the 100 fixed qualitative samples at step 11000.
All 100 five-panel videos are included. No SSH tunnel, ngrok agent, Python backend,
model weights, credentials, or remote training service is needed to host this site.

## Preview

From this directory: `python3 -m http.server 18767 --bind 127.0.0.1`.
Open `http://127.0.0.1:18767/`.

## GitHub Pages

1. Create a repository for this gallery, or choose an existing repository.
2. Commit and push **the contents of this directory** to the repository's `main`
   branch. The `videos/` and `posters/` directories must also be committed.
3. In **Settings → Pages**, choose **Deploy from a branch → main → /(root)**.
4. GitHub will show the deployment URL. A project site typically lives at
   `https://ACCOUNT.github.io/REPOSITORY/`.

Use a normal Git commit for these small MP4 files; Git LFS is unnecessary.
Relative URLs work under a project subpath. `.nojekyll` disables Jekyll processing.
The website is normally publicly accessible; the previous ngrok password is not
part of this package. Do not add credentials to browser JavaScript.

## Included results

- Fixed step-11000 checkpoint; 50 denoising steps, guidance 1, shift 5.
- 81 frames at 16 FPS per sample.
- Five columns: source, prediction, target GT, predicted route, GT mask union.
- Predicted route participates in fusion; displayed route is averaged over 30
  DiT layers and 50 denoising steps, not a single instantaneous gate.
- Qualitative examples overlap the training data and are not a held-out benchmark.

Videos contain the original source and target material of the selected evaluation
samples as well as model outputs. Only publish in the intended access scope.
The manifest deliberately excludes server paths, training logs, and credentials.
