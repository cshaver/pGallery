pGallery
========

About
--------
pGallery is a jQuery plugin for creating a mobile-friendly image gallery from a list of images, created by [Cristina Shaver](http://cristinashaver.com/) and shamelessly based on the [Galleriffic plugin](http://www.twospy.com/galleriffic/).

You can view a demo [here](http://cristinashaver.com/sandbox/pGallery/demo.html).

Usage
-------
Include the required files in the <head> section of your page:
```html
<link rel="stylesheet" href="css/pgallery.css">
<link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">
<script src="js/jquery-1.10.2.js"></script>
<script src="js/jquery-ui-1.10.3.custom.min.js"></script>
<script src="js/jquery.swipe-events.js"></script>
<script src="js/jquery.pgallery.js"></script>
```
Note: You may not have to include Font Awesome and jQuery UI (see options)

Have your images like so:
```html
<ul id="thumbs">
  <li>
    <img src="images/myimage0.png" alt="My Title 0" />
  </li>
  <li>
    <img src="images/myimage1.png" alt="My Title 1" />
  </li>
  <li>
    <img src="images/myimage2.png" alt="My Title 2" />
  </li>
  <li>
    <img src="images/myimage3.png" alt="My Title 3" />
  </li>
</ul>
```
Then instantiate the plugin when the document is ready:
    jQuery(document).ready(function($) {
      $('#thumbs').pGallery(options);
    });

Options
-------
```javascript
defaults = {
  printableVersionText: "Printable Version",
  prevPhotoText: "< Previous Photo",
  nextPhotoText: "Next Photo >",
  prevButtonText: "< Prev",
  nextButtonText: "Next >",

  // if you leave these as they are, you should include the Font Awesome icons (or your own)
  mobileCloseMarkup: "<i class='icon-remove'/>",
  mobilePrevMarkup: "<i class='icon-chevron-left'/>",
  mobileNextMarkup: "<i class='icon-chevron-right'/>",

  // if true you must include the jQuery UI Slide effects
  mobileSlide: true
};
```
