!function ($) {
  
  $(function(){
  	
  	var wrap = $('div.load-wrap');
    $('ul.nav>li>a').on('click', function(e) {
    	var href = $(this).attr('href');
    	wrap.load(href + ' .container-fluid');
    	e.preventDefault();
    });

    $('.img-circle').popover({
      placement: 'bottom',
      trigger: 'hover'
    });
 

  })

}(window.jQuery)
