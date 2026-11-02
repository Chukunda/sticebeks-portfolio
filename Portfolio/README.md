# Sticebeks portfolio

A responsive static website for software development, video editing, content creation, cinematography, and AI tutoring.

## Preview and add videos

Open this Portfolio folder in VS Code and run `npm run dev`. Visit http://127.0.0.1:4321. No dependency installation is needed with Node.js installed.

Under the film carousel, expand **Add your videos**. Choose an MP4 or WebM (up to 80 MB), add its title, category, and optional caption, then select **Add video**. H.264 MP4 is recommended for broad browser support. This saves the clip into `assets/videos/` and adds an entry to `videos.json`.

This editor is available only from the bundled local preview server. Visitors to the public website see the gallery without upload controls. Using Live Server or opening index.html directly does not provide the upload editor.

Commit and push the video file and `videos.json` with the website changes to publish them through your existing GitHub-to-Netlify setup. Large libraries are better served by a video host; the gallery also accepts direct HTTPS MP4/WebM URLs in `videos.json`.

Visitors can swipe or use previous/next buttons to browse vertical frames. Each clip has native playback, sound, seeking, and fullscreen controls where supported by the browser. Horizontal footage fits inside the vertical frame without cropping. No clip autoplays; starting a clip pauses the others, and clips pause when moved out of view or when the tab is hidden.

## Update the website

Edit `content.js` for service descriptions, training offers, email, and project links. Training uses USD quotes on request, with no numeric prices displayed. The video editing offer covers After Effects, CapCut, motion graphics, and editing workflows.

Edit `index.html` for main copy and case-study notes, and `styles.css` for layout and colours. Project roles and results should only be added when confirmed. A supplied interface preview is not a claim about ownership or launch status.

## Hosting

Keep the working Netlify settings for this repository. This change preserves the existing `netlify.toml`. The website requires no build command. Enable Netlify form detection and test an inquiry after publishing. Submission notifications are configured in Netlify, not automatically sent by this code.

## Checks

`npm run check` validates JavaScript syntax. Review the site at phone and desktop sizes and test a real uploaded clip before publishing. The local inquiry form reports that it has not sent anything.

Instagram Reels: videos.json accepts a title and instagram shortcode. The external player loads after Watch Reel is clicked. The post must be public and permit embedding. A Watch on Instagram link is provided as a fallback.
