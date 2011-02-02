/*
 * PageSlide jQuery plugin.
 * 
 * # Modification of the Scott Robbin's pageSlide plugin
 * # Check it out at http://github.com/freshout/pageSlide
 *
*/
$.fn.pageSlide = function(opts) {
  var settings = $.extend({
    height: '85%',
    loading: false,
    buttons : {
      back : {
        display: true,
        label: "Back to site"
      },
      copy_url : {
        display: true,
        label: "Copy URL",
        success: "Copied to clipboard!"
      },
      view_original : {
        display: true,
        label: "View Original"
      },
      bookmarkers : {
        fb_share : {
          display: true,
          label: "Share"
        },
        display: true 
      },
      prev : {
        display: true,
        label: "PREV"
      },
      next : {
        display: true,
        label: "NEXT"
      }
    },     
    duration: 'normal',
    direction: 'top',
    opacity: 0.6,
    modal: false
  }, opts);

  var page = $(document),
      body = $('body'),
      collection = $(this),
      size = collection.size(),                          
      current = false;
            
  function _initialize(anchor) {
    if($('#pageslide-body-wrap').length != 0){
      return;
    }
    
    var psBodyWrap = $('<div />').attr('id', 'pageslide-body-wrap');
    body.children(':not(script)').wrapAll(psBodyWrap);
    
    var psSlideBack = $('<div />').addClass('pageslide-close-bar').attr('href', '#');
    
    settings.buttons.back.display && $('<a />').addClass('pageslide-close').text(settings.buttons.back.label).attr('href', '#').appendTo(psSlideBack);
    settings.buttons.copy_url.display && $('<a />').attr('id', 'glueButton').text(settings.buttons.copy_url.label).appendTo(psSlideBack);
    settings.buttons.view_original.display && $('<a />').attr('href', '#').addClass('view-original').text(settings.buttons.view_original.label).appendTo(psSlideBack);            
    settings.buttons.prev.display && size > 1 && $('<div>').addClass('slide-controls').html('<div><a href="#" class="prev">PREV</a><a href="" class="next">NEXT</a></div>').appendTo(psSlideBack) && $('<div />').addClass('psMessage').appendTo(psSlideBack);
    if(settings.buttons.bookmarkers.display){
      var bookmarkers = $('<div />').addClass('bookmarkers');
      settings.buttons.bookmarkers.fb_share.display && bookmarkers.append('<a href="javascript:void(0)" title="Share to Facebook" class="share-facebook"></a>');
      bookmarkers.appendTo(psSlideBack);
    }
    var psSlideContent = $('<div/>').hide().attr('id', 'pageslide-content').append(psSlideBack);            
    $('<iframe />').attr('id', 'pageslide-iframe').appendTo(psSlideContent);

    $('<div />').attr('id', 'pageslide-slide-wrap').append(psSlideContent).appendTo(body);

    if($('#pageslide-blanket').size() === 0 && settings.modal === true) {
      var psSlideBlanket = $('<div class="pageslide-close"/>').attr('id', 'pageslide-blanket');
      body.append(psSlideBlanket);
      psSlideBlanket.click(function() {
        return false;
      });
    }

    $(window).resize(function() {
    $('#pageslide-body-wrap').width(body.width());
    });

    $(anchor).attr('rel', 'pageslide'); 
    
    bindButtons();
  }
  
  function bindButtons() {
    var psIframe = $('#pageslide-iframe');
    $('.view-original').unbind('click').click(function(){
      window.location = psIframe.attr('src')
    });

    $('.pageslide-close').unbind('click').click(function(ev) {
      _closeSlide(ev);
      return false;
    });

    settings.buttons.prev.display && $('.slide-controls a').unbind('click').click(function(){
      current = $(this).hasClass('next') ? ((current == size-1) ? 0 : current+1) : ((current == 0) ? size-1 : current-1);
      var url = collection.eq(current).attr('href');
      psIframe.attr('src', url);
      settings.buttons.bookmarkers.display && changeFacebookURL(url);
      return false;
    });
  };
  
  function changeFacebookURL(url){
    $('.share-facebook').unbind('click').click(function(){
      window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(url), 'sharer', 'toolbar=0,status=0,width=626,height=436');
      return false;
    }).attr('href', "http://www.facebook.com/sharer.php?u="+encodeURIComponent(url));
  }
  
  function _openSlide(elm) {
    var psWrap = $('#pageslide-slide-wrap'),
        psBodyWrap = $('#pageslide-body-wrap'),
        psIframe = $('#pageslide-iframe'),
        psContent = $('#pageslide-content');
    if(psWrap.height() != 0) { 
      return false;
    }
    _showBlanket();
    var direction = {};
    var new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
    if(settings.direction === 'bottom') {
      direction = {
        bottom: '-' + new_height
      };
      psWrap.css('top', 'auto');
    } 
    else {       
      direction = {
        top: new_height
      };
      psWrap.css('bottom', 'auto');
    }
    body.attr('scrollTop', 0);
    _overflowFixAdd();                                                   
    
    $('#pageslide-body-wrap, #pageslide-slide-wrap').width(body.width());
    psWrap.animate({height: new_height}, settings.duration);
    psBodyWrap.animate(direction, settings.duration, function() {        
      body.css('position', 'relative').css('height', $(window).height());
      psContent.css('height', psWrap.height() - 42).show();
      settings.loading && psIframe.css('height', 0);
      $(elm).attr('href') !== psIframe.attr('src') && psIframe.attr('src', elm.href) && settings.buttons.bookmarkers.display && changeFacebookURL(elm.href);

      $(window).resize(function() {
        new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
        psWrap.css('height', new_height);
        psContent.css('height', psWrap.height() - 42);
        psBodyWrap.css('top', new_height);
      });

      settings.buttons.copy_url.display && loadZeroClipboard('glueButton', function(){
        $('.psMessage').html(settings.buttons.copy_url.success);
        setTimeout(function(){
          $('.psMessage').html('&nbsp;');
        }, 5000);
      }) && setZeroClipboardText(psIframe.attr('src'));
    });
  };
    
  function _closeSlide(event) {
    (event.button != 2 && $('#pageslide-slide-wrap').height() != 0) && $.fn.pageSlideClose(settings);
  }

  function _showBlanket() {
    settings.modal === true && $('#pageslide-blanket').toggle().animate({opacity: settings.opacity}, 'fast', 'linear');
  }

  function _overflowFixAdd() {
    $('html, body').css({overflowY: 'hidden'});
  }

  _initialize(this);

  return this.each(function() {
    var link = $(this);
    if(!link.hasClass('pageslide-binded')) {
      link.bind('click', function(e) {
        _openSlide(this);
        $('#pageslide-slide-wrap').unbind('click').click(function(e) {
          if(e.target.tagName != "A") { return false; }
        });
        if(settings.modal != true && !page.hasClass('pageslide-binded')) {
          page.click(function(ev) {
            if(e.target.tagName != "A") {
              _closeSlide(ev);
              return false;
            }
            $(this).addClass('pageslide-binded');
          });
        }
        link.addClass('pageslide-binded');
        return false;
      });
    }
  });
};

$.fn.pageSlideClose = function(opts) {
    var settings = $.extend({
        height: '300px',
        duration: 'normal',
        direction: 'top',
        modal: false,
        _identifier: $(this)
    }, opts);
    
    function _hideBlanket() {
      settings.modal === true && $('#pageslide-blanket').is(':visible') && $('#pageslide-blanket').animate({opacity: 0}, 'fast', 'linear', function() {
        $(this).hide();
      });
    }
    
    function _overflowFixRemove() {
        $('html, body').css({overflowY: ''});
    }              
    
    _hideBlanket();
    
    $('body').css('height', 'auto');
    $('#pageslide-slide-wrap').animate({
        height: 0
    }, settings.duration, function() {
        $('#pageslide-content').css('height', '0px').hide();
        $('#pageslide-body-wrap, #pageslide-slide-wrap').css({
            top: '0px',
            bottom: '0px',
            width: ''
        });
        $(window).unbind('resize');
        $('#pageslide-iframe').attr('src', 'about:blank');
        _overflowFixRemove();
    });
};

$(function() {
    $(document).keyup(function(event) {
        if ($("#pageslide-blanket").is(":visible") && event.keyCode == 27) {$(this).pageSlideClose({modal: true});}
    });
});