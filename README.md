# somuchfun
somuchfun website

Project pages display: title, details, description, material, then credits.
In each project's `project.js`, the `content` array controls the order of all
images, videos, and rows, which appear after the description.

In a `video-row`, use `null` in the `videos` array to reserve an empty column,
for example `videos: [{ src: "https://player.vimeo.com/video/250455103" }, null]`.
Empty slots are hidden on mobile, where videos stack vertically.
