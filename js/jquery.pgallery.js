;(function($) {

  // TODO:
  //   make sure we use ids, dont select stuff outside of plugin

  var pluginName = 'pGallery',
  defaults = {
    mobileModalEnabled: true,
    printableVersionText: "Printable Version",
    prevPhotoText: "< Previous Photo",
    nextPhotoText: "Next Photo >",
    prevButtonText: "< Prev",
    nextButtonText: "Next >",
    mobileCloseMarkup: "<i class='icon-remove'/>",
    mobilePrevMarkup: "<i class='icon-chevron-left'/>",
    mobileNextMarkup: "<i class='icon-chevron-right'/>",
  };

  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, 
          new pGallery( this, options ));
      }
    });
  };

  // Primary Galleriffic initialization function that should be called on the thumbnail container.
  function pGallery(element, options) {
    //  Extend Gallery Object
    $.extend( {}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;
    this._element = element;
    this.init();
  }

  pGallery.prototype.init = function(){
    // here should set elements to variables to avoid searching again
    // call methods to set up
    // break down methods as much as possible
    // simplify initial markup - add it all in init
    
    this.addMarkup();
    this.addControls();
  }

  pGallery.prototype.addMarkup = function() {
    // is there a way to make the code in this method prettier? :|
    this.$list = $(this._element);

    this.$list.wrap("<div id='thumbs-container'/>");
    this.$thumbsContainer = this.$list.parent();
    this.$pagination = $("<div class='pagination'/>");
    this.$thumbsContainer.prepend(this.$pagination);
    this.$thumbsContainer.append(this.$pagination.clone());
    this.$pagination = this.$thumbsContainer.find("div.pagination");

    this.$pGalleryContainer = $("<div id='pGalleryContainer'/>");
    this.$pGalleryContainer.insertBefore(this.$thumbsContainer);
    this.$pGalleryContainer.append(this.$thumbsContainer);

    this.$content = $("<div/>").addClass("pgallery-content");
    
    this.$controls = $("<div/>").addClass("controls");
    this.$bigSlideshowContainer = $("<div/>").addClass("big-slideshow-container");

    this.$loadingSlideshowContainer = $("<div/>").addClass("loading-slideshow-container");
    this.$loadingSlideshowContainer.append(this.$loading = $("<div/>").addClass("loading"));
    this.$loadingSlideshowContainer.append(this.$loadingCaptionContainer = $("<div/>").addClass("caption-container"));

    this.$slideshowContainer = $("<div/>").addClass("slideshow-container");
    this.$slideshowContainer.append(this.$slideshow = $("<div/>").addClass("slideshow"));
    this.$slideshowContainer.append(this.$captionContainer = $("<div/>").addClass("caption-container"));

    this.$bigSlideshowContainer.append(this.$loadingSlideshowContainer);
    this.$bigSlideshowContainer.append(this.$slideshowContainer);

    this.$content.append(this.$controls);
    this.$content.append(this.$bigSlideshowContainer);

    $("body").append(this.$mobileOverlay = $("<div id='mobile-overlay'></div>"));

    this.$mobileCloseButton = $("<div id='mobile-close-button'/>");
    this.$mobileCloseWrap = $("<div id='mobile-close-wrap'/>").append($("<a href='#'/>").append(this.$mobileCloseButton));
    this.$mobileCloseButton.append($(this._defaults.mobileCloseMarkup));

    this.$mobilePrevButton = $("<div id='mobile-prev-button'/>");
    this.$mobilePrevWrap = $("<div id='mobile-prev-wrap'/>").append($("<a href='#'/>").append(this.$mobilePrevButton));
    this.$mobilePrevButton.append($(this._defaults.mobilePrevMarkup));

    this.$mobileNextButton = $("<div id='mobile-next-button'/>");
    this.$mobileNextWrap = $("<div id='mobile-next-wrap'/>").append($("<a href='#'/>").append(this.$mobileNextButton));
    this.$mobileNextButton.append($(this._defaults.mobileNexteMarkup));

    this.$mobileThumbs = $("<ul/>").addClass("mobile-thumbs");
    this.$mobileLoader = $("<div id='mobile-loader'/>");

    this.$mobileOverlay.append(this.$mobileCloseWrap);
    this.$mobileOverlay.append(this.$mobilePrevWrap);
    this.$mobileOverlay.append(this.$mobileNextWrap);
    this.$mobileOverlay.append(this.$mobileThumbs);
    this.$mobileOverlay.append(this.$mobileLoader);

    this.$pGalleryContainer.append(this.$content);
    //this.$pGalleryContainer.append(this.$mobileOverlayTemp);

    var self = this;
    this.$list.children().each(function(i){
      var $this = $(this);
      $image = $this.find("img"),
      imageURI = $image.attr("src"),
      title = $image.attr("alt");
      $image.wrap("<a class='thumb' href='"+imageURI+"'/>");
      $image.wrap("<div class='thumb-wrap'/>");
      var $thumbWrap = $image.parent();
      $thumbWrap.css("background-image", "url('"+imageURI+"')");
      $image.hide();
      var $caption = $("<div/>").addClass("caption"),
      $download = $("<div/>").addClass("download").appendTo($caption),
      $printable = $("<a/>").attr("href", imageURI).text(self._defaults.printableVersionText).appendTo($download),
      $title = $("<div/>").addClass("image-title").text(title).appendTo($caption);
      $caption.appendTo($this);

      $this.addClass("image"+(i+1));

      self.$mobileThumbs.append($("<li/>").addClass("m-image"+(i+1)));
      self.overlayImageHtml(i+1);
    });
    self.$mobileThumbs.children().hide();
  }

  pGallery.prototype.addControls = function() {
    var self = this;

    // count the thumbs
    this.numThumbs = this.$list.children().length;
    this.divWidth = this.$thumbsContainer.width();
    this.liWidth = this.$list.children().first().outerWidth(true);
    this.currImage = 0;
    this.currPage = 0;
    this.perPage = 12;
    this.changingImage = false;
    
    // arrange them
    this.cols = Math.floor(this.divWidth/this.liWidth); 
    
    // arrange the left controls
    this.numPages = Math.ceil(this.numThumbs/this.perPage);
    this.$navPrevButton = $("<a/>").addClass("p-prev").text(this._defaults.prevButtonText).appendTo(this.$pagination);
    for (var i = 0; i < this.numPages; i++)
    {
      
      this.$pagination.append($("<a/>").addClass("p"+(i+1)).text((i+1)));
      var $pageButton = this.$pagination.find(".p"+(i+1));
      $pageButton.click(function(e) {
        e.preventDefault();
        self.pageChange($(this).text());
        return false;
      });
    }
    this.$navNextButton = $("<a/>").addClass("p-next").text(this._defaults.nextButtonText).appendTo(this.$pagination);

    this.$navPrevButton.click(function(e) {
      e.preventDefault();
      self.pagePrev();
      return false;
    });
    this.$navNextButton.click(function(e) {
      e.preventDefault();
      self.pageNext();
      return false;
    });

    this.$navPrevButton.hide();
    
    // make ellipses for hiding the page numbers on smaller screens and hide them
    this.$ellRight = $("<span class='r-ell'>...</span>").insertBefore(this.$pagination.children(".p"+this.numPages)).hide();
    this.$ellLeft = $("<span class='l-ell'>...</span>").insertAfter(this.$pagination.children(".p1")).hide();

    // place the right controls
    this.$controls.append(this.$prevButton = $("<a/>").addClass("prev").text(this._defaults.prevPhotoText));
    this.$controls.append(this.$nextButton = $("<a/>").addClass("next").text(this._defaults.nextPhotoText));
    
    this.$prevButton.click(function(e) {
      e.preventDefault();
      self.imagePrev();
      return false;
    });

    this.$nextButton.click(function(e) {
      e.preventDefault();
      self.imageNext();
      return false;
    });
    

    // setup thumb clicking
    this.$list.find("li > a").click(function(e) {
      e.preventDefault();
      if (self.mobileScreenSize()){
        self.showOverlay($(this).parent().attr('class'));
      }
      else{
        self.changeImage($(this).parent().attr('class'));
      }
      return false;
    });

    this.$mobileCloseWrap.children("a").click(function(e) {
      e.preventDefault();
      self.hideOverlay();
      return false;
    });

    this.$mobileNextWrap.children("a").click(function(e) {
      e.preventDefault();
      self.imageNext();
      return false;
    });
    this.$mobilePrevWrap.children("a").click(function(e) {
      e.preventDefault();
      self.imagePrev();
      return false;
    });

    this.changeImage('image1');
    
    var image = this.$list.children().first().find("img").attr('src');

    this.$mobileThumbs.children()
    .swipeEvents()
    .bind("swipeLeft",  function(){ self.imageNext(); })
    .bind("swipeRight", function(){ self.imagePrev(); });

    var rtime = new Date(1, 1, 2000, 12,00,00);
    var timeout = false;
    var delta = 200;
    $(window).resize(function() {
      rtime = new Date();
      if (timeout === false) {
          timeout = true;
          setTimeout(resizeend, delta);
      }
    });

    function resizeend() {
      if (new Date() - rtime < delta) {
          setTimeout(resizeend, delta);
      } else {
          timeout = false;
          self.resize();
      }               
    } 

    $(document).keyup(function(e) {
      if (e.keyCode == 27) { // escape key
        console.log("escape");
        self.hideOverlay();
      }
      if (e.keyCode == 39) { // right arrow
        console.log("right");
        self.imageNext();
      }
      if (e.keyCode == 37) { // right arrow
        console.log("left");
        self.imagePrev();
      }
    });

    this.resize();
  }

  pGallery.prototype.changeImage = function(liClass, right) {
    right = typeof right !== 'undefined' ? right : true;
    
    if (parseInt(liClass.replace("image","")) == this.currImage)
      return;
    this.currImage = parseInt(liClass.replace("image",""));
    
    this.$list.children().removeClass("current");
    this.$list.children("."+liClass).addClass("current");
    
    var title = this.$list.children("."+liClass).find("a").attr('title');
    //var imageURI = this.$list.children("."+liClass).find("div").css("background-image").replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    var imageURI = this.$list.children("."+liClass).find("img").attr('src');
    var slideshowHtml = "<img alt='"+(title != null?title:"")+"' src='"+imageURI+"'/>";

    this.$loadingSlideshowContainer.children(".loading").html(this.$slideshow.html());
    this.$slideshow.html(slideshowHtml);
    this.$loadingCaptionContainer.html(this.$captionContainer.html());
    this.$captionContainer.html(this.$list.children("."+liClass).find(".caption").html());
    var time = 500;
    if (this.$loadingSlideshowContainer.is(':animated') || this.$slideshowContainer.is(':animated')){
      time = 0;
    }
    if (this.$loadingSlideshowContainer.children(".loading").html() != "")
    {
      this.$loadingSlideshowContainer.fadeTo(0, 1);
      this.$slideshowContainer.fadeTo(0, 0);
      this.$loadingSlideshowContainer.fadeTo(time, 0);
      this.$slideshowContainer.fadeTo(time, 1);
    }
    
    // also do this for the mobile overlay, regardless of its showing or not
    this.loadOverlayImage(this.currImage, right);
    this.checkPageBounds();
  }

  pGallery.prototype.resize = function() {
    var self = this;
    this.$list.children().each(function(){
      $(this).height($(this).width());
      $(this).find(".thumb-wrap").height($(this).height()-2);
    });
  }

  pGallery.prototype.imageNext = function() {
    if (this.currImage == this.numThumbs)
      this.changeImage("image1");
    else
      this.changeImage("image"+(this.currImage+1));
  }

  pGallery.prototype.imagePrev = function() {
    if (this.currImage == 1)
      this.changeImage("image"+this.numThumbs, false);
    else
      this.changeImage("image"+(this.currImage-1), false);    
  }

  pGallery.prototype.pageNext = function() {
    if (this.currPage < this.numPages)
      this.pageChange(parseInt(this.currPage)+1);
  }

  pGallery.prototype.pagePrev = function() {
    if (this.currPage > 1)
      this.pageChange(parseInt(this.currPage)-1);     
  }

  pGallery.prototype.pageChange = function(page, changeSlideshow) {
    changeSlideshow = typeof changeSlideshow !== 'undefined' ? changeSlideshow : true;
    if (page == this.currPage)
      return;
    this.currPage = page;
    
    this.$pagination.children().removeClass("current");
    this.$pagination.children(".p"+this.currPage).addClass("current");
    
    // hide all thumbs, then show thumbs on current page
    this.$list.children().hide();
    for (var i = (this.currPage-1)*this.perPage + 1; i < Math.min(this.currPage*this.perPage+1, this.numThumbs+1); i++)
    {
      this.$list.children(".image" + i).show();
    }
    
    if (changeSlideshow)
    {
      this.changeImage("image"+this.getPageLowerBounds(this.currPage));
    }
    
    this.adjustPagination();
    this.resize();
    // TODO: make this all happen at the same time, and add fadein/fadeout effects
  }

  pGallery.prototype.checkPageBounds = function() {
    // TODO: make sure we're one the right page
    //     (typically after hiting prev/next image)
    var correctPage = this.getPageFromIndex(this.currImage);
    if (correctPage != this.currPage)
    { 
      this.pageChange(correctPage, false);
    }
  }

  pGallery.prototype.getPageLowerBounds = function(page) {
    return ((this.currPage-1)*this.perPage)+1;
  }

  pGallery.prototype.getPageUpperBounds = function(page) {
    return this.page*this.perPage
  }

  pGallery.prototype.getPageFromIndex = function(index) {
    return (((index-1 - ((index-1)%this.perPage))/this.perPage) +1);
  }

  pGallery.prototype.adjustPagination = function() {
    var tempPage = parseInt(this.currPage);
    var tempNumPages = this.numPages;
    var totalWidth = 0;
    var allowedToRemove = new Array();
    this.$pagination.children().each(function(index) {
      $(this).show();
      totalWidth += $(this).outerWidth(true);
      
      $(this).removeClass("current");
      var thisClass = $(this).attr("class");
      var thisPageNum = parseInt(thisClass.replace("p",""));
      if (!(thisClass == "p-prev" || thisClass == "p-next" ||
       thisPageNum == tempPage || thisPageNum == (tempPage+1) ||
       thisPageNum == (tempPage-1) || thisPageNum == 1 || thisPageNum == tempNumPages ||
       thisClass == "l-ell" || thisClass == "r-ell")){
        allowedToRemove.push(thisPageNum);
      }
    });
    
    if (this.currPage >= this.numPages){
      this.$navNextButton.hide();
    }
    if (this.currPage <= 1){
      this.$navPrevButton.hide();
    }
    
    this.$ellLeft.hide();
    this.$ellRight.hide();
    
    while (allowedToRemove.length > 0 && totalWidth > this.$pagination.width())
    {
      // hide pages furthest away from current page
      // max two ellipsis, at the ends
      // do not hide:
      //  current, adjacent to current, first, last
      
      // if greater/less than current show right/left ellipses
      
      
      var maxDist = 0;
      var maxPage = 0;

      for (var i = 0; i < allowedToRemove.length; i++)
      {
        if (Math.abs(allowedToRemove[i] - this.currPage) > maxDist)
        {
          maxDist = Math.abs(allowedToRemove[i] - this.currPage);
          maxPage = i;
        }
      }
      
      this.$pagination.children(".p"+allowedToRemove[maxPage]).hide();
      allowedToRemove.splice(maxPage, 1);
      
      if (allowedToRemove[maxPage] < this.currPage){
        this.$ellLeft.show();
      }
      if (allowedToRemove[maxPage] > this.currPage){
        this.$ellRight.show();
      }
      
      totalWidth = 0;
      this.$pagination.children(":visible").each(function() {
        totalWidth += $(this).outerWidth(true);
      });
    }
    
    this.$pagination.children(".p"+this.currPage).addClass("current");
  }

  pGallery.prototype.mobileScreenSize = function(){
    if ($(window).width() < 772){ // width in em
      return true;
    }
    else{
      return false;
    }
  }

  pGallery.prototype.showOverlay = function(image){
    // makes overlay and image appear
    // loads in next and previous images
    // needs next and prev buttons, close button
    // need to dynamically place images to center them
    // initialize swiping?
    
    this.$mobileOverlay.show();
    $("body").css("overflow", "hidden");
    this.changeImage(image, true);
  }

  pGallery.prototype.loadOverlayImage = function(image, right){
    right = typeof right !== 'undefined' ? right : true;
    
    if (right == true){
      this.$mobileThumbs.children(":visible").hide('slide', {direction: 'left'}, 300);
    }
    else{
      this.$mobileThumbs.children(":visible").hide('slide', {direction: 'right'}, 300);
    }

    if (right == true){
      this.$mobileThumbs.children(".m-image"+image).show('slide', {direction: 'right'}, 300);
    }
    else{
     this.$mobileThumbs.children(".m-image"+image).show('slide', {direction: 'left'}, 300);
   }
    this.fixMargins(image)
 }

 pGallery.prototype.overlayImageHtml = function(image){
  var title = this.$list.children(".image" + image).children("a").attr('title');
  var medLink = this.$list.children(".image" + image).children("a").attr('href');
  var html = "<img alt='"+(title != null?title:"")+"' src='"+medLink+"'/>";
  this.$mobileThumbs.children(".m-image"+image).html(html);
}

pGallery.prototype.fixMargins = function(image){
  // good lord fix this
  var self = this;
  this.$mobileThumbs.find(".m-image"+image+ " > img").each(function(i){
    $(this).css("margin-left",self.realWidth($(this), true)/-2).css("margin-top",self.realHeight($(this), true)/-2);
  
    //console.log("margin-left: " + $(this).css("margin-left"));
  });
  //this.$mobileThumbs.children(".m-image"+image).children()
  //                  .css("margin-left",this.realWidth(this.$mobileThumbs.children(".m-image"+image).children())/-2);
  //this.$mobileThumbs.children(".m-image"+image).children()
  //                  .css("margin-top", this.realHeight(this.$mobileThumbs.children(".m-image"+image).children())/-2);
}

pGallery.prototype.hideOverlay = function(){
    // hide overlay
    this.$mobileOverlay.hide();
    $("body").css("overflow", "auto");
}

pGallery.prototype.realWidth = function(obj, limitToWindow){
  var clone = obj.clone();
  clone.css("visibility","hidden");
  if (limitToWindow){
    clone.css("max-width", "100%");
    clone.css("max-height", "100%");
  }
  $('body').append(clone);
  var width = clone.outerWidth();
  clone.remove();
  return width;
}

pGallery.prototype.realHeight = function(obj, limitToWindow){
  var clone = obj.clone();
  clone.css("visibility","hidden");
  if (limitToWindow){
    clone.css("max-width", "100%");
    clone.css("max-height", "100%");
  }
  $('body').append(clone);
  var height = clone.outerHeight();
  clone.remove();
  return height;
}    

})(jQuery);
