$(function() {
  $.fn.changeomatic = function(e, options) {
    if (typeof(e) == 'string') {
      options = options || {}
    } else {
      options = e || {}
    }
    elt = this[0]
    switch (e) {
      case 'tag':
        // change the tag & reset
        $(elt).data('tag', options)
        load()
        break
      default:
        // setup ui
        $(elt).addClass('changeomatic-set')
        $(elt).append('<div class="photos"></div>')
        var prev = $('<div class="cycle-prev prev">&lsaquo;</div>')
        var next = $('<div class="cycle-next next">&rsaquo;</div>')
        $('.photos', this).append(next, prev)

        var captionId = $(this).parents('.tab-pane').attr('id') + '-caption'
        var caption = $('<div class="caption"><div class="bg"></div><div id="'+captionId+'" class="cycle-caption"></div></div>')
        $(this).append(caption)

        $('.photos', elt).cycle({
          fx: 'fade',
          centerHorz: true,
          centerVert: true,
          autoHeight: '1618:1000',
          caption: '#'+captionId,
          captionTemplate: "{{title}} by {{owner}} ({{license}}) on <a href='{{url}}'>{{provider}}</a> <span class='pull-right'>{{date}} <span class='muted'>({{slideNum}}/{{slideCount}})</span></span>"
        })


        if (options.tag) {
          $(elt).changeomatic('tag', options.tag)
        }
        break
    }

    function loadingNotice(msg) {
      var notice = $('.notice', elt).get(0)
      if (notice) {
        notice = $(notice)
      } else {
        notice = $('<div class="notice"></div>')
        $(elt).append(notice)
      }
      if (msg) {
        notice.show()
        notice.html(msg)
      } else {
        notice.hide()
      }
    }

    function load() {
      var tag = $(elt).data('tag')
      if (!tag || tag.length == 0) { return }
      loadingNotice('Loading data...')
      loadFlickr(tag)
      // loadTwitter()
      // loadInstagram()
    }

    function finishedLoad() {
      loadingNotice('Preparing slideshow...')
      var photos = $(elt).data('photos') || []
      photos.sort(function(a,b) {
        if (a.taken < b.taken) return -1
        if (a.taken > b.taken) return 1
        return 0
      })
      $(elt).data('photos', photos)
      $.each(photos, function() {
        var photo = this
        var img = $('<img />').attr('src', photo.src).data({
          title: photo.title || 'unknown',
          owner: photo.owner || 'unknown',
          license: photo.license || "All rights reserved",
          provider: photo.provider || 'unknown',
          url: photo.url,
          date: $.format.date(photo.taken, "MMM d, yyyy")
        })
        $('.photos', elt).cycle('add', img)
      })
      if (photos.length == 0) {
        loadingNotice("No matching photos yet.")
      } else {
        loadingNotice(false)
      }
    }

    function loadFlickr(tag, options) {
      if (!options) options = {};
      var page = options['page'] || 1;
      loadingNotice('Loading flickr photos, page '+page+'...')
      $.getJSON(
        "http://www.flickr.com/services/rest/?method=flickr.photos.search&format=json&jsoncallback=?",
        {
          api_key: '19060c9919cc35bec4b32329b7fa6f3c',
          tags: tag,
          tag_mode: 'all',
          sort: 'date_taken',
          extras: "date_taken,url_m,url_l,owner_name,license",
          page: page,
          per_page: 500
        },
        function(json) {
          var photos = $(elt).data('photos') || [],
              flickrPhotos = []
          $.each(json.photos.photo, function(i, photo) {
            var license
            switch (photo.license) {
              case "0":
                license = "All Rights Reserved"
                break
              case "1":
                license = "CC BY-NC-SA"
                break
              case "2":
                license = "CC BY-NC"
                break
              case "3":
                license = "CC BY-NC-ND"
                break
              case "4":
                license = "CC BY"
                break
              case "5":
                license = "CC SA"
                break
              case "6":
                license = "CC ND"
                break
              case "7":
                license = "PD"
                break
              case "8":
                license = "United States Government Work"
                break
            }
            flickrPhotos.push({
              taken: Date.parse(photo.datetaken.replace(/-/g, '/')),
              src: photo.url_l,
              url: 'http://flickr.com/photos/'+photo.owner+'/'+photo.id,
              width: photo.width_l,
              height: photo.height_l,
              title: photo.title,
              owner: photo.ownername,
              provider: 'Flickr',
              license: license,
              object: photo
            })
          })
          $(elt).data('photos', photos.concat(flickrPhotos))
          if (json.photos.page < json.photos.pages) {
            loadFlickr(tag, {page: page + 1});
          } else {
            if (options.next) {
              options.next.call(tag, options)
            } else {
              finishedLoad()
            }
          }
        }
      ) 
    }
  }
})
