# Your portfolio

A responsive portfolio for software development, video editing, content creation, cinematography, and AI tutoring. Built with HTML, CSS, and JavaScript. No installation or build step is required.

## Preview in VS Code

Open this folder in VS Code. Open a terminal and run `npm run dev`, then visit http://127.0.0.1:4321. Stop with Ctrl+C. You can also use VS Code's Live Server extension.

## Make it yours

Edit `content.js` for your name, email, projects, links, and rates. Rates accept a complete label, for example `From ₦50,000 / project`; use your own confirmed amounts. Leave a rate blank to show the placeholder. Replace example projects with real work before publishing. The decorative artwork represents project spaces, not completed client work.

Edit `index.html` for introductory and about copy. Edit `styles.css` for colours and layout. Fonts use Google Fonts with system fallbacks. Add your own social sharing image and its absolute URL in an `og:image` meta tag once you have a domain.

## Deploy to Netlify

Upload the folder through Netlify's manual deployment interface, or put it in your own GitHub repository and connect it to Netlify. Leave the build command empty and use `.` as the publish directory. `netlify.toml` already sets the publish directory.

Enable form detection in the Netlify dashboard before deploying/redeploying. After deployment, submit a test inquiry and confirm it appears in the site's Forms dashboard. Set up submission notifications there. The form does not send email by itself. Local preview deliberately prevents submission and explains that nothing was sent. Netlify must process the form before it can receive real inquiries.

## Checks

Run `npm run check` for JavaScript syntax checks. Review the mobile menu, project filters, inquiry fields, and layout at phone and desktop sizes before launch.
