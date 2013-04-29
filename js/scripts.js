!function ($) {
  
  function load_ui (){
  	
  	// var wrap = $('div.load-wrap');
   //  $('ul.nav>li>a').on('click', function(e) {
   //  	var href = $(this).attr('href');
   //  	wrap.load(href + ' .container-fluid');
   //  	e.preventDefault();
   //  });

    // carousel
    $('.carousel').carousel({
      interval: false,
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

  }

  $(document).ready(load_ui);

}(window.jQuery)
