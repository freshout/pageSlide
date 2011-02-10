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
    direction: 'top'
  }, opts);

  var page = $(document),
      body = $('body'),
      htmlDom = $('html'),
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
    
    $('<div />').attr("id", "pageslide-blanket").appendTo(body).click(function(){
      return false;
    });
    
    $(window).resize(function() {
    $('#pageslide-body-wrap').width(body.width());
    });

    $(anchor).attr('rel', 'pageslide'); 
    
    _bindButtons();
  }
  
  function _bindButtons() {
    var psIframe = $('#pageslide-iframe');
    $('.view-original').unbind('click').click(function(){
      window.location = psIframe.attr('src')
    });

    $('.pageslide-close').unbind('click').click(function(ev) {
      collection.trigger('closePageSlide');
      return false;
    });

    settings.buttons.prev.display && $('.slide-controls a').unbind('click').click(function(){
      current = $(this).hasClass('next') ? ((current == size-1) ? 0 : current+1) : ((current == 0) ? size-1 : current-1);
      var url = collection.eq(current).attr('href');
      psIframe.attr('src', url);
      settings.buttons.bookmarkers.display && _changeFacebookURL(url);
      return false;
    });
  };
  
  function _changeFacebookURL(url){
    $('.share-facebook').unbind('click').click(function(){
      window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(url), 'sharer', 'toolbar=0,status=0,width=626,height=436');
      return false;
    }).attr('href', "http://www.facebook.com/sharer.php?u="+encodeURIComponent(url));
  }
  
  function _showBlanket() {                   
    $("#pageslide-blanket").css('height', page.height()).toggle().animate({opacity: '0.25'}, 'fast', 'linear');
  }
  
  function _hideBlanket() {
    $("#pageslide-blanket").is(":visible") && $("#pageslide-blanket").animate({opacity: '0.0'}, 'fast', 'linear', function () {
      $(this).hide();
    });
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
    var direction = {},
        new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
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
    body.add(htmlDom).css({overflowY: 'hidden'});
    
    psWrap.animate({height: new_height}, settings.duration);
    psBodyWrap.animate(direction, settings.duration, function() {        
      psContent.css('height', psWrap.height() - 40).show();
      settings.loading && psIframe.css('height', 0);
      $(elm).attr('href') !== psIframe.attr('src') && psIframe.attr('src', elm.href) && settings.buttons.bookmarkers.display && _changeFacebookURL(elm.href);

      $(window).resize(function() {
        new_height = settings.height.charAt(settings.height.length - 1) == '%' ? Math.ceil($(window).height() * parseFloat(settings.height) / 100) + 'px' : settings.height;
        psWrap.css('height', new_height);
        psContent.css('height', psWrap.height() - 40);
        psBodyWrap.css('top', new_height);
      });

      settings.buttons.copy_url.display && loadZeroClipboard('glueButton', function(){
        var psMessage = $('.psMessage');
        psMessage.html(settings.buttons.copy_url.success);
        setTimeout(function(){
          psMessage.html('&nbsp;');
        }, 5000);
      }) && setZeroClipboardText(psIframe.attr('src'));
    });
  };
  
  collection.bind('closePageSlide', function(event){
      if(event.button != 2 && $('#pageslide-slide-wrap').height() != 0){
        _hideBlanket();
        body.css('height', 'auto');
        $('#pageslide-slide-wrap').animate({height: 0}, settings.duration, function() {
          $('#pageslide-content').css('height', '0px').hide();
          $('#pageslide-body-wrap, #pageslide-slide-wrap').css({
            top: '0px',
            bottom: '0px',
            width: ''
          });
          $(window).unbind('resize');
          $('#pageslide-iframe').attr('src', 'about:blank');
          body.add(htmlDom).css({overflowY: ''});
        });
      }
  });  
  

  _initialize(this);

  page.click(function(ev) {
    if(ev.target.tagName != "A") {
      collection.trigger('closePageSlide');
      return false;
    }
  });
  
  return this.each(function() {
    var link = $(this);
    if(!link.hasClass('pageslide-binded')) {
      link.bind('click', function(e) {
        _openSlide(this);
        link.addClass('pageslide-binded');
        return false;
      });
    }
  });
};

$(function() {
  $(document).keyup(function(event) {                                     
    $("#pageslide-blanket").is(":visible") && event.keyCode == 27 && $('a').trigger('closePageSlide');
  });
});

$(window).load(function(){
  $('#pageslide-blanket').css('min-height', $(document).height());
})