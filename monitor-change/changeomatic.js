$(function() {
  $.fn.changeomatic = function(e, options) {
    if (typeof(e) == 'string') {
      options = options || {}
    } else {
      options = e || {}
    }
    var elt = this[0],
        that = this
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
        var pager = $('<div class="cycle-pager"></div>').attr('id', 'cycle-pager-'+(new Date()).getTime())
        $('.photos', this).append(next, prev)
        $(this).after(pager)

        var captionId = $(this).parents('.tab-pane').attr('id') + '-caption'
        var caption = $('<div class="caption"><div class="bg"></div><div id="'+captionId+'" class="cycle-caption"></div></div>')
        $(this).append(caption)

        $('.photos', elt).cycle({
          fx: 'fade',
          centerHorz: true,
          centerVert: true,
          autoHeight: '1618:1000',
          caption: '#'+captionId,
          captionTemplate: "{{title}} by {{owner}} ({{license}}) on <a href='{{url}}'>{{provider}}</a> <span class='pull-right'>{{date}} <span class='muted'>({{slideNum}}/{{slideCount}})</span></span>",
          pauseOnHover: true,
          pager: '#'+pager.attr('id'),
          pagerTemplate: "<a class='item' href=#>&nbsp;</a>"
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
      loadFlickr(tag, {next: loadInstagram})
      // Note: twitter just isnt' going to work in the browser without some server-side proxy:
      // http://stackoverflow.com/questions/17004070/making-jquery-ajax-call-to-twitter-api-1-1-search
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
          license: photo.license || "all rights reserved",
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
                license = "all rights reserved"
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
            if (!photo.datetaken) {
              return
            }
            flickrPhotos.push({
              taken: $.format.parseDate(photo.datetaken).date,
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
              next = options.next
              options.next = null
              next.call(that, tag, options)
            } else {
              finishedLoad()
            }
          }
        }
      ) 
    }
    function loadInstagram(tag, options) {
      if (!options) options = {};
      var page = options['page'] || 1;
      loadingNotice('Loading Instagram photos, page '+page+'...')
      $.getJSON(
        "https://api.instagram.com/v1/tags/"+tag+"/media/recent?callback=?",
        {
          client_id: '2d095c63a6a54bbab08e170725414095',
          max_tag_id: options.max_tag_id
        },
        function(json) {
          var photos = $(elt).data('photos') || [],
              igPhotos = []
          $.each(json.data, function(i, photo) {
            var date = new Date(0)
            date.setUTCSeconds(parseInt(photo.created_time))
            igPhotos.push({
              taken: date,
              src: photo.images.standard_resolution.url,
              url: photo.link,
              width: photo.images.standard_resolution.width,
              height: photo.images.standard_resolution.height,
              title: photo.caption ? photo.caption.text : 'Untitled',
              owner: photo.user.full_name + ' ('+photo.user.username+')',
              provider: 'Instagram',
              license: "all rights reserved",
              object: photo
            })
          })
          $(elt).data('photos', photos.concat(igPhotos))
          if (json.pagination.next_max_tag_id) {
            loadInstagram(tag, {max_tag_id: json.pagination.next_max_tag_id, page: page+1});
          } else {
            if (options.next) {
              options.next.call(this, tag, options)
            } else {
              finishedLoad()
            }
          }
        }
      )
    }
  }
})
