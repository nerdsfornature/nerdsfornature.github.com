!function ($) {
  
  // misc ui elements
  function load_ui (){
  	
  	// var wrap = $('div.load-wrap');
   //  $('ul.nav>li>a').on('click', function(e) {
   //  	var href = $(this).attr('href');
   //  	wrap.load(href + ' .container-fluid');
   //  	e.preventDefault();
   //  });

    // carousel
    $('.carousel').carousel({
      interval: 7000,
      pause: "hover"
    })

    $('img.img-circle').popover({
      placement: 'bottom',
      trigger: 'hover'
    });

    $('a.trigger').popover({ 
      html : true,
      trigger: 'hover',
      placement: 'bottom',
      offset: '50px',
      title: function() {
        return $(this).parent().find('.head').html();
      },
      content: function() {
        return $(this).parent().find('.content').html();
      }
    });

    $('.cal-popup').magnificPopup({
      disableOn: 700,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,

      fixedContentPos: false
    });

  }
  $(document).ready(load_ui);

  $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { e.stopPropagation(); });
  
  // call flickr api & append to bootstrap carousel
  function load_carousel (){

    var flickrFeedUrl = "http://api.flickr.com/services/feeds/photos_public.gne?id=93492443@N06&tags=gallery&jsoncallback=?";    
    $.getJSON(flickrFeedUrl, { format: "json" },
        function (data) {
            var firstImg = $("#first-img");
            var activeImg = $("<img>").attr("src", data.items[0].media.m.replace("_m.jpg", "_z.jpg"));
            firstImg.append(activeImg); 
            var captionWrap = $("<div>").attr("class", "carousel-caption");
            var title = $("<h4>").append(data.items[0].title);
            var a = $("<a>").attr("href", data.items[0].link).attr("title", data.items[0].title);
            title.appendTo(a);
            a.appendTo(captionWrap);              
            captionWrap.appendTo(firstImg);
            
            $.each(data.items.slice(1), function (i, item) {
              var innerDiv = $("<div>").attr("class", "item");
              var img = $("<img>").attr("src", item.media.m.replace("_m.jpg", "_z.jpg"));              
              var captionWrap = $("<div>").attr("class", "carousel-caption");
              var title = $("<h4>").append(item.title);
              var a = $("<a>").attr("href", item.link).attr("title", item.title);

              img.appendTo(innerDiv);
              title.appendTo(a);
              a.appendTo(captionWrap);              
              captionWrap.appendTo(innerDiv);
              
              $(".carousel-inner").append(innerDiv);

              if (i == 17) return false;
            });
        });
  }
  $(document).ready(load_carousel);



}(window.jQuery)
